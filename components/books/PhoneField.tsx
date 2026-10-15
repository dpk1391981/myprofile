"use client";

/**
 * Optional WhatsApp / mobile number for the book signup forms.
 *
 * A plain <input type="tel"> accepted anything ("33432432sdfdfdsffsdf"), so this
 * is a real phone field: a country code picker (+91 first — most readers are in
 * India), and a number box that only ever holds digits — letters are dropped as
 * they are typed or pasted, and a leading 0 or a pasted "+91" is cleaned off.
 *
 * Validation uses the input's own constraint API (setCustomValidity), so the
 * browser blocks submit and shows the message in place, exactly like the
 * required name and email fields — the forms need no extra error state.
 *
 * `onChange` receives the full number ("+919876543210"), or "" when the field
 * is empty. The server re-validates (_normalise_phone in book_routes.py).
 */

import { useEffect, useRef, useState } from "react";
import { IconBrandWhatsapp } from "@tabler/icons-react";

const CODES = [
  { code: "+91", label: "IN +91", min: 10, max: 10 },
  { code: "+1", label: "US +1", min: 10, max: 10 },
  { code: "+44", label: "UK +44", min: 10, max: 10 },
  { code: "+971", label: "AE +971", min: 8, max: 9 },
  { code: "+65", label: "SG +65", min: 8, max: 8 },
  { code: "+61", label: "AU +61", min: 9, max: 9 },
  { code: "+49", label: "DE +49", min: 10, max: 11 },
  { code: "+977", label: "NP +977", min: 10, max: 10 },
] as const;

function problem(code: string, digits: string): string {
  if (!digits) return "";                                   // optional
  const c = CODES.find((x) => x.code === code) || CODES[0];
  if (code === "+91" && !/^[6-9]/.test(digits)) {
    return "An Indian mobile number starts with 6, 7, 8 or 9.";
  }
  if (digits.length < c.min || digits.length > c.max) {
    return c.min === c.max
      ? `Enter the ${c.min}-digit number (without the country code).`
      : `Enter ${c.min}–${c.max} digits (without the country code).`;
  }
  return "";
}

export default function PhoneField({
  id,
  onChange,
  className = "",
  style,
}: {
  id: string;
  onChange: (fullNumber: string) => void;
  /** Applied to the outer box so it matches the form's other inputs. */
  className?: string;
  style?: React.CSSProperties;
}) {
  const [code, setCode] = useState<string>("+91");
  const [digits, setDigits] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.setCustomValidity(problem(code, digits));
    onChange(digits ? `${code}${digits}` : "");
  }, [code, digits]); // eslint-disable-line react-hooks/exhaustive-deps

  function clean(raw: string) {
    let d = raw.replace(/\D/g, "");
    // A pasted "+91 98765 43210" or "098765 43210": drop what the picker owns.
    const cc = code.slice(1);
    if (raw.trim().startsWith("+") && d.startsWith(cc)) d = d.slice(cc.length);
    if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
    return d.slice(0, 15);
  }

  return (
    <div className={`bk-phone ${className}`} style={style}>
      <IconBrandWhatsapp size={18} aria-hidden="true" className="bk-phone-icon" />
      <label htmlFor={`${id}-cc`} className="sr-only">Country code</label>
      <select id={`${id}-cc`} value={code} onChange={(e) => setCode(e.target.value)}
              className="bk-phone-cc">
        {CODES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
      </select>
      <label htmlFor={id} className="sr-only">WhatsApp or mobile number (optional)</label>
      <input
        ref={inputRef}
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        value={digits}
        onChange={(e) => setDigits(clean(e.target.value))}
        placeholder="WhatsApp (optional)"
        className="bk-phone-input"
      />
    </div>
  );
}
