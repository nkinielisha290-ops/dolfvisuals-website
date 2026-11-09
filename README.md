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

**Njia za kuingia:** Google ("Continue with Google"), barua pepe + nenosiri, au link ya kuingia bila nenosiri (magic link).

**Portal ("Studio Pass"):**
- *Overview*: kadi ya dhahabu ya mteja (jina, namba ya mteja, tangu lini, hali ya 2FA), countdown ya session inayofuata, muhtasari wa malipo, booking ya karibuni.
- *Bookings*: kila booking kama fremu ya filamu, yenye hatua 6 za kazi (Imepokelewa → Maandalizi → Upigaji → Uhariri → Ukaguzi → Imekabidhiwa) na kitufe cha kupakua kazi.
- *Billing*: invoice kama tiketi (muhuri wa PAID, kiasi kilicholipwa), na historia ya malipo.
- *Settings & security*: taarifa binafsi, 2FA, njia za kuingia, kubadilisha nenosiri, na kutoka kwenye vifaa vingine.

**Ulinzi wa akaunti:**
- Uthibitisho wa email kabla ya kuingia, pamoja na kitufe cha kutuma tena.
- Uthibitisho wa hatua mbili (TOTP: Google Authenticator, Authy, Microsoft Authenticator). Unalazimishwa kwenye database (RLS): bila code, data ya mteja haisomeki hata kama mtu ana nenosiri.
- Nenosiri: herufi 8+ zenye herufi na namba, kipimo cha nguvu, na ukaguzi wa Have I Been Pwned (k-anonymity) unaokataa manenosiri yaliyovuja.
- Kubadilisha nenosiri kunahitaji nenosiri la sasa. Kurudisha nenosiri ni kwa link ya email.
- Rate limiting ya ziada kwenye kila fomu, honeypot dhidi ya bots, na CAPTCHA (Cloudflare Turnstile) si lazima.
- Redirect zinaruhusiwa ndani ya website tu, sessions ni cookies za httpOnly, na kuna "Sign out of all other devices".
- Akaunti za admin (`dv_admin_users`) haziwi wateja. Mteja anaona rekodi zake tu, bila draft wala notes za ndani.

**Kuwasha (Supabase dashboard):**
1. *Authentication → URL Configuration*: Site URL = domain ya website, na Redirect URLs = `https://<domain>/auth/callback`.
2. *Authentication → Providers → Email*: Confirm email = ON, Secure email change = ON, minimum password length = 8.
3. *Authentication → Providers → Google*: weka Client ID + Secret kutoka Google Cloud Console (OAuth client, Web application). Authorized redirect URI ni `https://<project>.supabase.co/auth/v1/callback`.
4. *Authentication → Multi-Factor*: TOTP = enabled (kwa kawaida iko ON).
5. Si lazima: *Authentication → Attack Protection* → CAPTCHA (Turnstile) + leaked password protection. Kisha weka `NEXT_PUBLIC_TURNSTILE_SITE_KEY` kwenye Vercel.

Bila Supabase, kurasa hizi zinaonyesha ujumbe wa "coming soon" pamoja na vitufe vya booking na WhatsApp.

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
