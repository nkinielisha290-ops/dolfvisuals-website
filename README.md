# DOLF VISUALS — Website & Admin

Official website for **DOLF VISUALS** (Photography · Videography · Creative Agency), built by EllieTech Solutions.
Brief: `docs/brief.md`

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Supabase (database, auth, storage) · deploy on Vercel

## Kuanza (run locally)

```bash
npm install
npm run dev        # http://localhost:3000
```

Bila Supabase, website inafanya kazi kwa demo content iliyomo (`lib/seed.ts`). Booking form inaonyesha "asante" na kitufe cha WhatsApp, lakini haihifadhi kitu.

## Kuunganisha database (dynamic content + admin)

1. Tengeneza project kwenye **supabase.com**.
2. **SQL Editor** → run `supabase/schema.sql`, kisha `supabase/seed.sql`.
3. Nakili `.env.example` kuwa `.env.local`, kisha jaza `NEXT_PUBLIC_SUPABASE_URL` na `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API).
4. **Authentication → Users → Add user**: weka email na password ya admin. Kisha kwenye SQL Editor:
   ```sql
   insert into dv_admin_users (email) values ('dolfvisuals@gmail.com');
   ```
5. Restart `npm run dev`, kisha ingia kwenye **/admin/login**.

Kwenye Vercel, weka env variables zilezile kwenye Project Settings → Environment Variables.

## Website (public)

| Ukurasa | Maelezo |
|---|---|
| `/` | Hero ya kisinema, huduma, kazi teule, jinsi tunavyofanya kazi, testimonials, CTA |
| `/about` | Historia, mission, vision, values, team |
| `/services`, `/services/[slug]` | Huduma 9 kutoka brief, kila moja na packages na portfolio yake |
| `/portfolio` | Gallery yenye categories 12, filter, na lightbox ya full-screen (keyboard + swipe, video za YouTube/Vimeo) |
| `/projects` | Case studies |
| `/pricing` | Packages ("On request" mpaka bei iwekwe) |
| `/testimonials` | Shuhuda zilizothibitishwa tu, pamoja na video testimonials |
| `/contact` | Mawasiliano, WhatsApp, fomu, ramani |
| `/booking` | Fomu ya booking (huduma, tarehe, mahali, bajeti) inayoingia kwenye admin, na pia kitufe cha kuituma WhatsApp |

- **Lugha:** EN / SW switch (cookie). Content ya database ina fields `_en` na `_sw`.
- **SEO:** metadata kwa kila ukurasa, `sitemap.xml`, `robots.txt`, na JSON-LD ya LocalBusiness.
- **WhatsApp:** kitufe kinachoelea kwenye kila ukurasa.
- **Notifications (si lazima):** weka `RESEND_API_KEY` + `NOTIFY_EMAIL` ili kupokea email kila booking au ujumbe mpya unapoingia.

## Admin (`/admin`)

- **Dashboard:** bookings mpya, matukio yanayokuja, ujumbe mpya, reviews za kuthibitisha.
- **Bookings:** status (new → contacted → quoted → confirmed → completed), notes za bei, malipo na deliverables, na vitufe vya WhatsApp/Call.
- **Messages:** ujumbe kutoka Contact page.
- **Portfolio:** pakia picha nyingi kwa mara moja (zinapunguzwa ukubwa automatically), weka category, featured na hide/show. Kwa video, weka link ya YouTube.
- **Services, Packages & Prices, Projects, Team, Testimonials:** ongeza, hariri au futa, kwa Kiingereza na Kiswahili.
- **Settings:** headline ya home, tagline, simu, WhatsApp, email, na social links.

Ulinzi: Row Level Security. Wageni wanaweza kusoma content na kutuma booking tu. Admin peke yake ndiye anaweza kubadilisha content na kusoma bookings.

## Business management (CRM) — `/admin`

- **Clients:** usajili wa wateja. Bookings za website zinaunda mteja automatically, na zinaunganishwa kwa namba ya simu, kwa hiyo hakuna duplicates.
- **Bookings / Projects:** booking au quotation yenye namba ya kumbukumbu (DV-YYMMDD-XXXX), status, hatua za kazi (pre-production → shooting → editing → review → delivered), bei iliyokubaliwa, na link ya kukabidhi kazi.
- **Invoices:** namba zinajitengeneza (DV-2026-0001), items, discount, VAT, na ukurasa wa kuchapisha / Save as PDF. Unaweza kutuma kwa WhatsApp.
- **Payments:** M-Pesa, Mixx by Yas (Tigo Pesa), Airtel Money, HaloPesa, Bank, Cash. Status ya invoice inajibadilisha yenyewe (partially paid / paid).
- **Communication log:** kumbukumbu za WhatsApp, simu, email na mikutano kwa kila mteja.
- **Dashboard:** mapato ya mwezi, madeni (outstanding & overdue), miradi inayoendelea, matukio yajayo, malipo ya karibuni.
- **Clients & Awards:** wateja wakubwa, washirika, tuzo, vyeti na press. Zinaonekana kwenye Home na About zikiwekwa tu.

Tables zote zina kiambishi `dv_`, kwa hiyo database hii inaweza kukaa kwenye Supabase project moja na mifumo mingine.

## Akaunti za wateja — `/account`

- **Kujisajili:** `/account/register` (jina, simu, email, nenosiri). Mteja anapokea email ya kuthibitisha, kisha anaingia `/account/login`. Kuna "Forgot password" (`/account/forgot`).
- **Portal ya mteja:** booking zake zote na hatua ya kazi (progress bar), namba ya kumbukumbu, kitufe cha kupakua kazi ikiwa tayari (link ya deliverables kutoka admin), invoice zake (kuona / kuchapisha / PDF), malipo yake, na kubadilisha taarifa na nenosiri.
- **Kuunganisha na CRM:** akaunti ikithibitishwa, inaunganishwa na mteja aliyepo mwenye email ileile, au inaunda mteja mpya. Booking anazoweka akiwa ameingia zinaingia kwenye akaunti yake moja kwa moja, na fomu inajazwa taarifa zake.
- **Usalama (RLS):** mteja anaona rekodi zake tu. Invoice za "draft" na notes za ndani za admin hazionekani kwake.
- **Supabase → Authentication → URL Configuration:** weka *Site URL* = domain ya website, na *Redirect URLs* = `https://<domain>/auth/callback`.
- Bila Supabase, kurasa hizi zinaonyesha ujumbe wa "coming soon" pamoja na vitufe vya booking na WhatsApp.

## Social media

Admin → Settings: Instagram, TikTok, Facebook, YouTube, LinkedIn na X. Zinaonekana kwenye footer, menu ya simu, Contact, na sehemu ya "Follow our work" kwenye Home. Link ambayo haijawekwa haionyeshwi.

## Chatbot

Msaidizi wa kuchat (kona ya chini kushoto), kwa Kiingereza na Kiswahili. Anajibu kuhusu huduma, bei/packages, booking, mahali, mawasiliano, akaunti, malipo na muda wa kukabidhi, kwa kutumia data halisi ya website, na anampeleka mteja WhatsApp kwa maswali mengine.
Si lazima: weka `ANTHROPIC_API_KEY` kwenye Vercel ili maswali ambayo hayapo kwenye FAQ yajibiwe na AI (Claude). AI inaruhusiwa kutumia taarifa za website tu, na haibuni bei wala tarehe.

## Brand

Rangi: Black `#111111`, Gold `#D4AF37`, White, Grey `#777777`. Fonts: Bebas Neue, Montserrat, Poppins na Inter (self-hosted kupitia @fontsource). Logo: `public/brand/`.

## Bado inasubiri kutoka kwa mteja

- Bei rasmi za packages (sasa zinaonyesha "On request")
- Social media links (Admin → Settings): Instagram, TikTok, Facebook, YouTube, LinkedIn, X
- Team: majina, picha, vyeo
- Testimonials halisi (zinaonekana kwenye website tu zikiwa zimewekwa "Approved")
- Picha na video zaidi za portfolio
- Domain na business email
- Kuthibitisha tagline: brief imeandika "TURNINGMOMENTSINTO ATRS". Tumetumia "Turning Moments Into Art", na inaweza kubadilishwa kwenye Settings.
