import Image from "next/image";
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionHead from "@/components/SectionHead";
import { getDict, tr } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { getPortfolio, getTeam } from "@/lib/data";

export const revalidate = 60;
export const metadata: Metadata = { title: "About Us", description: "The story, mission, vision and team behind DOLF VISUALS." };

const VALUES = {
  en: [
    ["Creativity", "Delivering original and innovative visual concepts."],
    ["Professionalism", "Maintaining high standards in every project."],
    ["Excellence", "Pursuing outstanding quality and attention to detail."],
    ["Innovation", "Embracing modern technology and creative techniques."],
    ["Consistency", "Maintaining a recognizable brand identity."],
    ["Integrity", "Building trust through reliability and commitment."],
  ],
  sw: [
    ["Ubunifu", "Kuleta mawazo ya kuona ya asili na ya kibunifu."],
    ["Weledi", "Kudumisha viwango vya juu katika kila mradi."],
    ["Ubora", "Kutafuta ubora wa hali ya juu na umakini katika kila undani."],
    ["Uvumbuzi", "Kukumbatia teknolojia ya kisasa na mbinu za kibunifu."],
    ["Uthabiti", "Kudumisha utambulisho wa brand unaotambulika."],
    ["Uadilifu", "Kujenga imani kupitia uaminifu na kujitoa."],
  ],
};

export default async function About() {
  const lang = await getLang();
  const t = getDict(lang);
  const [team, portfolio] = await Promise.all([getTeam(), getPortfolio()]);
  const sw = lang === "sw";

  return (
    <>
      <PageHero eyebrow={t.about_eyebrow} title={sw ? "Hadithi ya DOLF VISUALS" : "The DOLF VISUALS story"}
        text={sw ? "Brand ya upigaji picha, video na ubunifu wa kuona — iliyojitolea kunasa matukio yenye maana na kusimulia hadithi zenye nguvu."
                 : "A photography, videography and creative media brand dedicated to capturing meaningful moments and telling compelling visual stories."}
        image={portfolio[2]?.image_url} />

      <section className="mx-auto grid max-w-7xl gap-16 px-4 py-24 sm:px-8 md:py-32 lg:grid-cols-[1fr_1.1fr]">
        <div className="reveal-img relative aspect-[4/5] overflow-hidden lg:sticky lg:top-28 lg:self-start">
          <Image src={portfolio.find((p) => p.category === "commercial")?.image_url ?? portfolio[0].image_url} alt="" fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
        </div>
        <div className="space-y-14">
          <div className="reveal">
            <p className="eyebrow">{sw ? "Mwanzo mpya" : "A new chapter"}</p>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-white/70">
              {sw ? (<>
                <p>DOLF VISUALS ni brand ya ubunifu ya upigaji picha, video na uzalishaji wa kuona, iliyoanzishwa rasmi tarehe <strong className="text-white">11 Oktoba 2025</strong> nchini Tanzania.</p>
                <p>Brand hii ilizaliwa baada ya kupotea kwa kumbukumbu zote za mtangulizi wake, KHAMY_PHOTOGRAPHY, mwishoni mwa Septemba 2025. Changamoto hiyo ikawa mwanzo wa sura mpya — fursa ya kujenga upya, kuunda utambulisho imara zaidi na kufuata malengo makubwa zaidi katika tasnia ya uzalishaji wa kuona.</p>
                <p>Tarehe 11 Oktoba 2026, DOLF VISUALS iliadhimisha mwaka wake wa kwanza — mwaka wa ukuaji, ustahimilivu, ubunifu na kujitoa kujenga brand yenye uwezo wa kushindana kwa viwango vya kimataifa.</p>
              </>) : (<>
                <p>DOLF VISUALS is a creative photography, videography and visual production brand officially established on <strong className="text-white">11 October 2025</strong> in Tanzania.</p>
                <p>The brand was born following the loss of the entire database belonging to its predecessor, KHAMY_PHOTOGRAPHY, at the end of September 2025. That setback marked the beginning of a new chapter — an opportunity to rebuild, establish a stronger brand identity and pursue greater ambitions in visual production.</p>
                <p>On 11 October 2026, DOLF VISUALS celebrated its first anniversary — one year of growth, resilience, creativity and commitment to building a brand capable of competing at international production standards.</p>
              </>)}
            </div>
          </div>
          <div className="grid gap-px bg-line sm:grid-cols-2">
            <div className="reveal bg-ink p-8">
              <p className="eyebrow">{t.mission}</p>
              <p className="mt-4 leading-relaxed text-white/75">{sw ? "Kunasa, kuunda na kukabidhi simulizi za kuona za kipekee kupitia upigaji picha wa kitaalamu, video na suluhisho za ubunifu wa vyombo vya habari." : "To capture, create and deliver exceptional visual stories through professional photography, videography and creative media solutions."}</p>
            </div>
            <div className="reveal bg-ink p-8">
              <p className="eyebrow">{t.vision}</p>
              <p className="mt-4 leading-relaxed text-white/75">{sw ? "Kuwa brand ya ubunifu wa kuona inayotambulika na kuaminika, inayojulikana kwa ubora, ubunifu, uvumbuzi na usimulizi bora wa kuona." : "To become a recognized and trusted creative visual media brand, known for excellence, creativity, innovation and outstanding visual storytelling."}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-ink-2">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-8">
          <p className="eyebrow reveal">{t.values_eyebrow}</p>
          <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES[lang].map(([h, p], i) => (
              <div key={h} className="reveal" style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
                <h3 className="font-display text-4xl tracking-wide text-white">{h}</h3>
                <p className="mt-2 text-white/55">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-8 md:py-32">
        <SectionHead eyebrow={t.team_eyebrow} title={t.team_title} />
        {team.length === 0 ? (
          <p className="reveal mt-10 border border-dashed border-line p-10 text-center text-white/45">{t.team_empty}</p>
        ) : (
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <article key={m.id} className="reveal group">
                <div className="relative aspect-[4/5] overflow-hidden bg-ink-2">
                  {m.photo_url && <Image src={m.photo_url} alt={m.name} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0" />}
                </div>
                <h3 className="mt-5 font-heading text-lg font-bold">{m.name}</h3>
                <p className="font-sub text-sm text-gold">{tr(m, "role", lang)}</p>
                {tr(m, "bio", lang) && <p className="mt-3 text-sm leading-relaxed text-white/55">{tr(m, "bio", lang)}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
