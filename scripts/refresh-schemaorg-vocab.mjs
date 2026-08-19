#!/usr/bin/env node
/**
 * Regenerates scripts/schemaorg-vocab.json from schema.org's canonical dump.
 *
 * WHY THE SNAPSHOT IS COMMITTED. The validator has to answer "is this a real
 * schema.org type?" on every run, including in CI and offline. Fetching 1.5MB
 * of JSON-LD each time makes the validator depend on a network round trip to do
 * its main job, and a fetch failure would silently downgrade the check to
 * "everything passes" — the worst possible failure mode for a validator.
 *
 * WHY IT IS NOT HAND-MAINTAINED. It was, once: a curated `KNOWN_TYPES` set
 * written from memory. It contained `ContactAction`, which does not exist in
 * schema.org, so the validator certified an invalid type as valid and the error
 * only surfaced on validator.schema.org after deploy. A list of what a person
 * believes schema.org contains is not a check — it is the same guess, twice.
 *
 * Run after a schema.org release:  node scripts/refresh-schemaorg-vocab.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const SOURCE = "https://schema.org/version/latest/schemaorg-current-https.jsonld";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "schemaorg-vocab.json");

/*
  The dump is not purely schema.org. It carries stub `rdfs:Class` nodes for
  equivalent classes in other vocabularies — `gs1:Country`, `unece:Country`,
  `lcc-cr:Country`, `cmns-ge:GeopoliticalEntity` and many more — each with an
  @id and nothing else.

  Stripping the prefix and keying on the local name therefore collapses four
  different `Country` nodes onto one key, and whichever empty stub is written
  last wins. That produced a Country with no superclasses, which broke ancestry
  and made `name` on a Country look like a domain violation.

  So: only `schema:`-prefixed nodes are read, and only `schema:` references are
  followed. Everything else belongs to another vocabulary and is not ours to
  model.
*/
const SCHEMA_PREFIX = "schema:";
const rawId = (v) => String(typeof v === "object" ? v?.["@id"] ?? "" : v);
const isSchema = (v) => rawId(v).startsWith(SCHEMA_PREFIX);
const localName = (v) => rawId(v).slice(SCHEMA_PREFIX.length);
const asList = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

const res = await fetch(SOURCE);
if (!res.ok) throw new Error(`${SOURCE} → HTTP ${res.status}`);
const graph = (await res.json())["@graph"];

const classes = {};        // ClassName -> [direct superclasses]
const properties = {};     // propertyName -> [classes the property is defined on]
// Text, Number, Quantity and their kin — roots of their own tree. `DataType`
// is seeded because it is that tree's own root: its only superclass is
// rdfs:Class, which is not part of the schema.org vocabulary.
const datatypes = new Set(["DataType"]);

/*
  `@type` is sometimes an array: the datatype roots (`Text`, `Number`,
  `Quantity`) are declared as `["rdfs:Class", "schema:DataType"]`. Matching the
  string form alone dropped them, which orphaned every datatype beneath them.
*/
const typesOfNode = (node) => asList(node["@type"]).map(String);

for (const node of graph) {
  if (!isSchema(node["@id"])) continue;
  const name = localName(node["@id"]);
  const nodeTypes = typesOfNode(node);
  if (nodeTypes.includes("schema:DataType")) datatypes.add(name);
  if (nodeTypes.includes("rdfs:Class")) {
    classes[name] = [
      ...new Set(asList(node["rdfs:subClassOf"]).filter(isSchema).map(localName)),
    ].sort();
  } else if (nodeTypes.includes("rdf:Property")) {
    const domains = [
      ...new Set(asList(node["schema:domainIncludes"]).filter(isSchema).map(localName)),
    ].sort();
    if (domains.length) properties[name] = domains;
  }
}

// Ancestry is the whole point of the file; a class that cannot reach Thing
// means the filter above is wrong again.
const orphans = Object.keys(classes).filter((c) => {
  const seen = new Set();
  const walk = (t) => {
    if (!t || seen.has(t) || !(t in classes)) return;
    seen.add(t);
    classes[t].forEach(walk);
  };
  walk(c);
  if (c === "Thing" || seen.has("Thing")) return false;
  // Datatypes are a separate tree with their own roots and never descend
  // from Thing — not orphans, just not Things.
  return !datatypes.has(c) && ![...seen].some((t) => datatypes.has(t));
});
if (orphans.length) {
  console.warn(`WARNING: ${orphans.length} class(es) do not resolve to Thing: ${orphans.slice(0, 12).join(", ")}`);
}

writeFileSync(OUT, JSON.stringify({
  source: SOURCE,
  generated: new Date().toISOString().slice(0, 10),
  classes,
  properties,
}, null, 0) + "\n");

console.log(`${OUT}: ${Object.keys(classes).length} classes, ${Object.keys(properties).length} properties`);
