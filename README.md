# Gearhood — founding owner registration

A small Next.js site where Cape Town owners register gear they'd rent out.
Registrations are saved in a Supabase (Postgres) database.

- Landing page with the founding-owner offer, an earnings example, how it works and FAQs
- Registration form: name, WhatsApp, suburb, up to 5 items, optional referral code, POPIA consent
- Each owner gets a referral code and a ready-to-share invite message
- The public can only **add** registrations. Nobody can read the data except you (Supabase dashboard).

## 1. Create the database (about 10 minutes)

1. Go to <https://supabase.com>, sign up and create a **new project** (choose the region closest to South Africa, and save the database password somewhere safe).
2. In the project, open **SQL Editor → New query**.
3. Paste everything from `supabase/schema.sql` and click **Run**. You should see "Success".
4. Open **Project Settings → API** and copy two values:
   - **Project URL** → this is `SUPABASE_URL`
   - **anon public** key → this is `SUPABASE_ANON_KEY`

## 2. Run it on your computer (optional)

```bash
npm install
cp .env.example .env.local   # then paste your two values into .env.local
npm run dev                  # open http://localhost:3000
```

Submit a test registration, then check **Table Editor → owners** and **items** in Supabase.
Delete the test rows afterwards.

## 3. Put it online with Vercel (about 15 minutes)

1. Push this folder to a new GitHub repository.
2. Go to <https://vercel.com>, sign in with GitHub, and click **Add New → Project**. Pick the repository.
3. Under **Environment Variables** add `SUPABASE_URL` and `SUPABASE_ANON_KEY` with your values.
4. Click **Deploy**. You get a live link such as `gearhood.vercel.app`; you can add your own domain later in Vercel's settings.

## Seeing and managing registrations

- **Table Editor → owners**: one row per owner. Update `status` as you go:
  `registered` → `contacted` → `photo_booked` → `active` (or `declined`). Use `notes` for anything else.
- **Table Editor → items**: one row per item, with a suggested day rate (4% of replacement value).
  Status: `registered` → `photo_booked` → `live` (or `rejected`).
- **All in one view**: SQL Editor → `select * from owner_items;`
- **Export**: in Table Editor, use the export button to download CSV.

Useful queries:

```sql
-- Items per suburb and category
select o.suburb, i.category, count(*) from items i join owners o on o.id = i.owner_id
group by 1, 2 order by 1, 3 desc;

-- Who referred the most owners
select referred_by, count(*) from owners where referred_by is not null
group by 1 order by 2 desc;
```

## Changing the offer and options

Edit `lib/config.ts`: suburbs, categories, value cap (R15,000), commission (15%),
free months (3) and referral credit (R50). Copy on the page is in `app/page.tsx`.
Only promise what you are ready to honour — the founding-owner offer and referral credit are your decisions.

If you change the categories or the value cap, update the matching checks in
`supabase/schema.sql` too, and run the changed lines in the SQL Editor.

## Privacy (POPIA)

- The form asks for consent before saving, and records when it was given (`consent_at`).
- Only collect what you need; don't add ID numbers to this form.
- If someone asks to be removed, delete their row in **owners** (their items are deleted with it).
- Keep your Supabase password and the **service_role** key private. This site only uses the anon key,
  which can do nothing except call the registration function.
