import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { CATEGORIES, MAX_ITEMS, VALUE_CAP } from "@/lib/config";

type ItemIn = { name?: unknown; category?: unknown; value?: unknown };

const MESSAGES: Record<string, string> = {
  consent_required: "Please tick the consent box so we can contact you.",
  items_required: "Add at least one item.",
  items_count: `Add between 1 and ${MAX_ITEMS} items.`,
  already_registered: "This WhatsApp number is already registered. We'll be in touch soon.",
};

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return bad("Something went wrong reading the form. Please try again.");
  }

  // Honeypot: real people never fill this hidden field.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true, code: "THANKS" });
  }

  const firstName = String(body.firstName ?? "").trim();
  const whatsapp = String(body.whatsapp ?? "").trim();
  const suburb = String(body.suburb ?? "").trim();
  const referredBy = String(body.referredBy ?? "").trim().slice(0, 12);
  const consent = body.consent === true;
  const rawItems = Array.isArray(body.items) ? (body.items as ItemIn[]) : [];

  if (!firstName || firstName.length > 60) return bad("Add your first name.");
  if (!/^\+?[0-9 ]{9,16}$/.test(whatsapp)) return bad("Add a valid WhatsApp number, for example +27 82 123 4567.");
  if (!suburb) return bad("Choose your suburb.");
  if (!consent) return bad(MESSAGES.consent_required);

  const items = rawItems
    .map((i) => ({
      name: String(i.name ?? "").trim(),
      category: String(i.category ?? ""),
      value: Math.round(Number(i.value)),
    }))
    .filter((i) => i.name.length > 0);

  if (items.length < 1 || items.length > MAX_ITEMS) return bad(MESSAGES.items_count);
  for (const i of items) {
    if (i.name.length < 2 || i.name.length > 80) return bad("Give each item a short name.");
    if (!(CATEGORIES as readonly string[]).includes(i.category)) return bad("Choose a category for each item.");
    if (!Number.isFinite(i.value) || i.value < 100) return bad("Add a rough replacement value for each item.");
    if (i.value > VALUE_CAP) {
      return bad(`For now we can only take items worth up to R${VALUE_CAP.toLocaleString("en-ZA")}.`);
    }
  }

  try {
    const { data, error } = await supabaseServer().rpc("register_owner", {
      p_first_name: firstName,
      p_whatsapp: whatsapp,
      p_suburb: suburb,
      p_referred_by: referredBy,
      p_consent: consent,
      p_items: items,
    });
    if (error) {
      const key = Object.keys(MESSAGES).find((k) => error.message.includes(k));
      if (key) return bad(MESSAGES[key], key === "already_registered" ? 409 : 400);
      console.error("register_owner failed:", error.message);
      return bad("We couldn't save your registration. Please try again in a minute.", 500);
    }
    return NextResponse.json({ ok: true, code: data as string });
  } catch (e) {
    console.error(e);
    return bad("We couldn't save your registration. Please try again in a minute.", 500);
  }
}
