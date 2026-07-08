import { TopNav } from "@/components/manuscript/TopNav";
import { SiteFooter } from "@/components/manuscript/SiteFooter";
import { ManuscriptBreak } from "@/components/manuscript/ManuscriptBreak";
import { OrnamentalFrame } from "@/components/manuscript/OrnamentalFrame";
import { MaroonButton } from "@/components/manuscript/MaroonButton";
import {
  DancerSilhouette,
  JaliPattern,
  CornerFlourish,
  GhungrooMandala,
} from "@/components/manuscript/Ornaments";
import Link from "next/link";

const featureCards = [
  {
    icon: "auto_stories",
    title: "Composition Library",
    body: "Document every Tukra, Tora, and Paran with precision. Attach audio recordings and notation in a structured, classical format.",
    cta: "View Samples",
    href: "/sign-in",
  },
  {
    icon: "history_toggle_off",
    title: "Riyaz Tracker",
    body: "Log your daily practice hours and metabolic intensities. Watch your stamina grow as you track footwork cycles and laya mastery over years.",
    cta: "Log Session",
    href: "/sign-in",
  },
  {
    icon: "theater_comedy",
    title: "Performance Folio",
    body: "Archive videos of your stage moments. Keep notes on guru critiques and audience energy to reflect on your artistic evolution.",
    cta: "Relive Moments",
    href: "/sign-in",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <TopNav />

      <header className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-margin-mobile pt-24 md:px-margin-page">
        {/* Decorative corners */}
        <div className="pointer-events-none absolute left-8 top-32 h-16 w-16 border-l-2 border-t-2 border-secondary/40 md:left-24" />
        <div className="pointer-events-none absolute right-8 top-32 h-16 w-16 border-r-2 border-t-2 border-secondary/40 md:right-24" />
        <div className="pointer-events-none absolute bottom-12 left-8 h-16 w-16 border-b-2 border-l-2 border-secondary/40 md:left-24" />
        <div className="pointer-events-none absolute bottom-12 right-8 h-16 w-16 border-b-2 border-r-2 border-secondary/40 md:right-24" />

        <div className="relative z-10 max-w-4xl text-center">
          <div className="mb-6 flex justify-center">
            <GhungrooMandala className="text-secondary" size={96} />
          </div>

          <h1 className="mb-4 font-display text-display-lg-mobile leading-tight text-primary md:text-display-lg">
            A sacred archive for your dance journey
          </h1>
          <p className="mx-auto mb-12 max-w-2xl font-serif text-body-lg italic text-on-surface-variant">
            Preserve compositions, riyaz, performances, and guru wisdom in one
            timeless digital manuscript.
          </p>

          <div className="flex flex-col items-center justify-center gap-6 md:flex-row">
            <Link href="/sign-up" className="w-full md:w-auto">
              <MaroonButton variant="filled" className="w-full md:w-auto">
                Begin Your Journal
              </MaroonButton>
            </Link>
            <Link href="/sign-in" className="w-full md:w-auto">
              <MaroonButton variant="outline" className="w-full md:w-auto">
                Sign In
              </MaroonButton>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 opacity-60">
          <span className="font-serif text-label-md uppercase tracking-widest">
            Explore the Folios
          </span>
          <span className="material-symbols-outlined animate-bounce text-secondary">
            expand_more
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-margin-mobile py-section-gap md:px-margin-page">
        <ManuscriptBreak className="mb-section-gap" />

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {featureCards.map((card) => (
            <OrnamentalFrame
              key={card.title}
              className="bg-surface-container-low transition-transform duration-500 hover:-translate-y-2"
            >
              <div className="flex flex-col items-center p-8 text-center">
                <div className="mb-6">
                  <span className="material-symbols-outlined text-5xl text-secondary">
                    {card.icon}
                  </span>
                </div>
                <h3 className="mb-4 font-display text-headline-lg text-primary">
                  {card.title}
                </h3>
                <p className="font-serif text-body-md leading-relaxed text-on-surface-variant">
                  {card.body}
                </p>
                <div className="mt-8 w-full border-t border-secondary/20 pt-6">
                  <Link
                    href={card.href}
                    className="font-serif text-label-md uppercase tracking-widest text-secondary transition-colors hover:text-primary"
                  >
                    {card.cta} →
                  </Link>
                </div>
              </div>
            </OrnamentalFrame>
          ))}
        </div>

        <section className="mt-section-gap flex flex-col items-center gap-16 py-12 md:flex-row">
          <div className="flex-1 space-y-6">
            <h2 className="font-display text-headline-lg italic text-primary underline decoration-secondary decoration-1 underline-offset-8">
              The Wisdom of Lineages
            </h2>
            <p className="font-serif text-body-lg leading-loose text-on-surface">
              In the tradition of Kathak, knowledge is often oral, passed down
              in whispers from Guru to Shishya. Kathak Journal provides a
              sanctuary for these ephemeral teachings, ensuring that the
              nuances of your Gharana are never lost to time.
            </p>
            <div className="flex items-center gap-4 italic text-secondary">
              <span className="material-symbols-outlined">ink_pen</span>
              <span className="font-serif text-body-md">
                Hand-crafted digital preservation.
              </span>
            </div>
          </div>
          <OrnamentalFrame className="relative aspect-[4/5] w-full flex-1 overflow-hidden bg-surface-container-low p-4">
            <div className="relative flex h-full w-full items-center justify-center">
              <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
                <JaliPattern opacity={1} />
              </div>
              <DancerSilhouette className="relative text-primary" size={280} />
              <div className="absolute left-3 top-3 text-secondary opacity-70">
                <CornerFlourish size={48} />
              </div>
              <div className="absolute bottom-3 right-3 rotate-180 text-secondary opacity-70">
                <CornerFlourish size={48} />
              </div>
            </div>
          </OrnamentalFrame>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
