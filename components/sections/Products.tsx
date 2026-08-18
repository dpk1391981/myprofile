import { getFlagshipProjects } from "../utils/portfolio-data";
import ProductCard from "./ProductCard";
import SectionHead from "./SectionHead";

/**
 * The products owned end to end.
 *
 * Each entry is rendered as a collapsed summary card (see ProductCard) rather
 * than the long-form article this section used to be: logo, name, one-line
 * hook, a clamped overview and three tags, with the problem statement, feature
 * list and role behind "View more". The section reads as four scannable
 * entries instead of four essays.
 */
export default function Products({ heading = true }: { heading?: boolean }) {
  const products = getFlagshipProjects();

  return (
    <section className="bs-wrap bs-section" id="products">
      {heading ? (
        <SectionHead
          kicker="Products I own end to end"
          title={`${products.length} products of my own — product, architecture, engineering and SEO, all mine.`}
        />
      ) : null}

      <div className="bs-product-grid bs-mt-6">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
