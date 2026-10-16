import RegisterForm from "@/components/RegisterForm";
import { OFFER, VALUE_CAP, rand } from "@/lib/config";

const perks = [
  { title: `0% commission for ${OFFER.freeMonths} months`, body: "Keep all the rent from your first rentals. After that Gearhood keeps 15%." },
  { title: "Free listing photos", body: "We visit, check your items and take the photos, so your listing looks good from day one." },
  { title: `R${OFFER.referralCredit} per friend`, body: "Share your code. You get credit each time a friend's item is rented." },
  { title: "Founding owner badge", body: "Your listings show first when renters arrive for the holidays." },
];

const steps = [
  { title: "Register in two minutes", body: "Tell us what you'd lend and roughly what it would cost to replace." },
  { title: "We check and photograph", body: "A short visit to see each item and agree a day rate and deposit." },
  { title: "Renters book", body: "They pay upfront and a deposit is held on their card." },
  { title: "You get paid", body: "Money reaches you after the item comes back in the same condition." },
];

const faqs = [
  { q: "What if something gets damaged?", a: "Repairs come out of the renter's deposit first. Every handover is photographed, and renters show ID before they book." },
  { q: "What can I list?", a: `Camping and beach gear, baby equipment, party gear and tools, worth up to ${rand(VALUE_CAP)} each for now.` },
  { q: "Do I have to meet renters?", a: "You hand over and collect the item, at a time you agree. You choose which bookings to accept." },
  { q: "Does it cost anything?", a: "No. Listing is free, and founding owners pay no commission for their first months." },
];

export default function Home() {
  return (
    <main>
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <span className="flex flex-col leading-tight">
            <span className="font-display text-2xl font-extrabold tracking-tight">Gearhood</span>
            <span className="text-xs text-muted">Rent gear from your neighbours</span>
          </span>
          <a href="#register" className="btn min-h-[44px] px-4 text-sm">Register your gear</a>
        </div>
      </header>

      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-12 md:grid-cols-[1.1fr_1fr] md:items-center">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-bold uppercase tracking-wider text-pink">Cape Town · founding owners wanted</p>
          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
            That tent in your garage could pay for itself this summer.
          </h1>
          <p className="max-w-[56ch] text-lg text-muted">
            Gearhood lets neighbours rent your camping gear, cooler boxes, baby gear and tools when you're not using them.
            We're signing up owners now, before renters arrive for the December holidays.
          </p>
          <a href="#register" className="btn self-start">Register as a founding owner</a>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-6">
          <p className="text-sm text-muted">Example: 4-person tent, R3,500 to replace</p>
          <dl className="mt-3 grid grid-cols-2 gap-3 tabular-nums">
            <div className="rounded-xl bg-bg p-3"><dt className="text-sm text-muted">Day rate</dt><dd className="font-display text-2xl font-extrabold">R140</dd></div>
            <div className="rounded-xl bg-bg p-3"><dt className="text-sm text-muted">Deposit held</dt><dd className="font-display text-2xl font-extrabold">R900</dd></div>
            <div className="rounded-xl bg-bg p-3"><dt className="text-sm text-muted">3-day weekend</dt><dd className="font-display text-2xl font-extrabold">R420</dd></div>
            <div className="rounded-xl bg-soft p-3"><dt className="text-sm text-muted">You keep (founding)</dt><dd className="font-display text-2xl font-extrabold text-accent">R420</dd></div>
          </dl>
          <p className="mt-3 text-sm text-muted">After the founding period you keep 85% of the rent: R357 for the same weekend.</p>
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <h2 className="font-display text-2xl font-extrabold">Why join now</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map((p) => (
              <li key={p.title} className="rounded-xl border border-line p-4">
                <h3 className="font-display text-lg font-bold">{p.title}</h3>
                <p className="mt-1 text-sm text-muted">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="font-display text-2xl font-extrabold">How it works</h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="flex flex-col gap-1 rounded-xl border border-line bg-surface p-4">
              <span className="font-display text-xl font-extrabold text-accent">{i + 1}</span>
              <h3 className="font-display font-bold">{s.title}</h3>
              <p className="text-sm text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="register" className="mx-auto grid max-w-5xl gap-8 px-4 pb-12 md:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-3xl font-extrabold">Register your gear</h2>
          <p className="text-muted">No commitment. We'll WhatsApp you to arrange a quick visit, then you decide.</p>
          <div className="mt-2 flex flex-col gap-3">
            {faqs.map((f) => (
              <details key={f.q} className="rounded-xl border border-line bg-surface p-4">
                <summary className="cursor-pointer font-semibold">{f.q}</summary>
                <p className="mt-2 text-sm text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
        <RegisterForm />
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted">
          Gearhood · Cape Town. Your details are used only to contact you about listing your items.
        </div>
      </footer>
    </main>
  );
}
