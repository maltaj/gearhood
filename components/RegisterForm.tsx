"use client";

import { useState } from "react";
import { CATEGORIES, MAX_ITEMS, OWNER_COMMISSION, SUBURBS, VALUE_CAP, rand, suggestedRate } from "@/lib/config";

type Item = { name: string; category: string; value: string };
const blank = (): Item => ({ name: "", category: "Camping", value: "" });

export default function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [suburb, setSuburb] = useState(SUBURBS[0]);
  const [referredBy, setReferredBy] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState(""); // honeypot
  const [items, setItems] = useState<Item[]>([blank()]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState("");

  function setItem(i: number, patch: Partial<Item>) {
    setItems((list) => list.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  }

  const weekend = items.reduce((sum, it) => {
    const v = Number(it.value);
    return v > 0 && v <= VALUE_CAP ? sum + suggestedRate(v) * 3 * (1 - OWNER_COMMISSION) : sum;
  }, 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName, whatsapp, suburb, referredBy, consent, company,
          items: items.map((it) => ({ name: it.name, category: it.category, value: Number(it.value) })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) setError(data.message || "We couldn't save your registration. Please try again.");
      else setCode(data.code);
    } catch {
      setError("No connection. Check your internet and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (code) {
    const share = `I'm a founding owner on Gearhood, renting gear to neighbours in Cape Town. Register your tent, cooler box or tools too, with my code ${code}.`;
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6" role="status">
        <p className="text-sm font-bold uppercase tracking-wider text-pink">You're registered</p>
        <h3 className="font-display text-2xl font-extrabold">Thanks, {firstName}. We'll WhatsApp you within two days.</h3>
        <p className="text-muted">We'll book a quick visit to check and photograph your items, then they go live before the holidays.</p>
        <div className="rounded-xl bg-soft p-4">
          <p className="text-sm text-muted">Your referral code</p>
          <p className="font-display text-3xl font-extrabold tracking-widest text-accent">{code}</p>
        </div>
        <p className="rounded-xl border border-line bg-bg p-3 text-sm">{share}</p>
        <button
          type="button"
          className="btn self-start"
          onClick={() =>
            navigator.clipboard?.writeText(share).then(
              () => setCopied("Copied. Paste it in your WhatsApp groups."),
              () => setCopied("Select the message above and copy it."),
            )
          }
        >
          Copy invite message
        </button>
        <p className="text-sm text-muted" aria-live="polite">{copied}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold" htmlFor="firstName">
          First name
          <input id="firstName" className="field" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold" htmlFor="whatsapp">
          WhatsApp number
          <input id="whatsapp" className="field" type="tel" autoComplete="tel" placeholder="+27 82 123 4567" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold" htmlFor="suburb">
          Suburb
          <select id="suburb" className="field" value={suburb} onChange={(e) => setSuburb(e.target.value)}>
            {SUBURBS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold" htmlFor="referredBy">
          Referral code (optional)
          <input id="referredBy" className="field uppercase" maxLength={12} value={referredBy} onChange={(e) => setReferredBy(e.target.value)} />
        </label>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-display text-lg font-bold">What would you lend?</legend>
        {items.map((it, i) => (
          <div key={i} className="grid gap-3 rounded-xl border border-line p-3 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-end">
            <label className="flex flex-col gap-1.5 text-sm font-semibold" htmlFor={`item-name-${i}`}>
              Item
              <input id={`item-name-${i}`} className="field" placeholder="e.g. 4-person tent" value={it.name} onChange={(e) => setItem(i, { name: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold" htmlFor={`item-cat-${i}`}>
              Category
              <select id={`item-cat-${i}`} className="field" value={it.category} onChange={(e) => setItem(i, { category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold" htmlFor={`item-val-${i}`}>
              Cost to replace (R)
              <input id={`item-val-${i}`} className="field" type="number" inputMode="numeric" min={100} max={VALUE_CAP} step={50} value={it.value} onChange={(e) => setItem(i, { value: e.target.value })} />
            </label>
            {items.length > 1 ? (
              <button type="button" className="min-h-[46px] rounded-[10px] border-[1.5px] border-line px-3 text-sm font-semibold" onClick={() => setItems((l) => l.filter((_, j) => j !== i))}>
                Remove
              </button>
            ) : <span />}
            {Number(it.value) > VALUE_CAP && (
              <p className="text-sm font-semibold text-pink sm:col-span-4">We can only take items up to {rand(VALUE_CAP)} for now.</p>
            )}
          </div>
        ))}
        {items.length < MAX_ITEMS && (
          <button type="button" className="self-start text-sm font-bold text-accent" onClick={() => setItems((l) => [...l, blank()])}>
            + Add another item
          </button>
        )}
        {weekend > 0 && (
          <p className="rounded-xl bg-soft p-3 text-sm">
            At suggested rates, these could earn you about <b>{rand(weekend)}</b> per 3-day weekend after fees.
          </p>
        )}
      </fieldset>

      {/* Honeypot field, hidden from people */}
      <div aria-hidden="true" className="absolute left-[-9999px]">
        <label htmlFor="company">Company</label>
        <input id="company" tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
      </div>

      <label className="flex items-start gap-3 text-sm" htmlFor="consent">
        <input id="consent" type="checkbox" className="mt-1 h-5 w-5" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>
          I agree that Gearhood may store my name, number, suburb and item details to contact me about listing my items.
          I can ask for my details to be deleted at any time.
        </span>
      </label>

      {error && <p className="text-sm font-semibold text-pink" role="alert">{error}</p>}
      <button type="submit" className="btn" disabled={busy}>{busy ? "Saving…" : "Register as a founding owner"}</button>
    </form>
  );
}
