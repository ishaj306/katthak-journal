import { TopNav } from "@/components/manuscript/TopNav";
import { SiteFooter } from "@/components/manuscript/SiteFooter";
import { ManuscriptBreak } from "@/components/manuscript/ManuscriptBreak";
import { OrnamentalFrame } from "@/components/manuscript/OrnamentalFrame";
import { MaroonButton } from "@/components/manuscript/MaroonButton";
import {
  JaliPattern,
  CornerFlourish,
  GhungrooMandala,
  LotusBloom,
} from "@/components/manuscript/Ornaments";
import { Icon } from "@/components/manuscript/Icons";
import Link from "next/link";

const pillars = [
  {
    Icon: Icon.Quill,
    title: "Your bols, never ours",
    body: "The platform never hands you pre-written compositions. Every Tukda, Toda, and Chakradar is yours — in your gharana's own hand.",
  },
  {
    Icon: Icon.Quote,
    title: "The guru's voice, preserved",
    body: "Capture each correction and teaching the moment it is given, and keep it searchable for the rest of your dancing life.",
  },
  {
    Icon: Icon.Calendar,
    title: "A companion for a lifetime",
    body: "Not an app you abandon in a month — a manuscript that deepens with every year of riyaz, every stage, every festival.",
  },
];

const features = [
  {
    Icon: Icon.Book,
    title: "Composition Library",
    body: "Inscribe every bol with its meaning, its guru, and its gharana. Attach audio and video so a phrase is never lost.",
  },
  {
    Icon: Icon.Tabla,
    title: "Riyaz & the Tala",
    body: "A gentle ledger of your practice — witnessed, never scored — with a tala metronome for all the common talas.",
  },
  {
    Icon: Icon.Ghungroo,
    title: "Ghungroo Hours",
    body: "Watch your lifetime practice earn the weight of each sacred bell, and keep a diary of the ghungroos themselves.",
  },
  {
    Icon: Icon.Mask,
    title: "Stage Journal",
    body: "Archive every performance with photos, video, and honest reflection on what the stage revealed.",
  },
  {
    Icon: Icon.Quill,
    title: "Journal & Journey",
    body: "A private page for riyaz reflections and discoveries, woven into an illuminated timeline of your whole art.",
  },
  {
    Icon: Icon.Peacock,
    title: "Lineage & Wardrobe",
    body: "See the gurus and gharanas woven through your work, and log every poshak and ornament you have worn.",
  },
];

const tools = [
  {
    Icon: Icon.Lotus,
    title: "Tihai Builder",
    body: "Enter your phrase and it solves the rest that lands the third repetition exactly on sam.",
  },
  {
    Icon: Icon.Scroll,
    title: "Layakari Calculator",
    body: "See how a phrase breathes across every speed — thaah to athgun — in any tala.",
  },
  {
    Icon: Icon.Tabla,
    title: "Tala Metronome",
    body: "The theka of each tala, with the sam and vibhags accented, to hold your laya as you practise.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <TopNav />

      {/* Hero */}
      <header className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-margin-mobile pt-24 md:px-margin-page">
        <div className="pointer-events-none absolute left-8 top-32 h-16 w-16 border-l-2 border-t-2 border-secondary/40 md:left-24" />
        <div className="pointer-events-none absolute right-8 top-32 h-16 w-16 border-r-2 border-t-2 border-secondary/40 md:right-24" />
        <div className="pointer-events-none absolute bottom-12 left-8 h-16 w-16 border-b-2 border-l-2 border-secondary/40 md:left-24" />
        <div className="pointer-events-none absolute bottom-12 right-8 h-16 w-16 border-b-2 border-r-2 border-secondary/40 md:right-24" />

        <div className="relative z-10 max-w-4xl text-center">
          <p className="mb-6 font-serif text-label-md uppercase tracking-[0.3em] text-secondary">
            A digital manuscript for the Kathak dancer
          </p>
          <div className="mb-6 flex justify-center">
            <GhungrooMandala className="text-secondary" size={96} />
          </div>

          <h1 className="mb-5 font-display text-display-lg-mobile leading-tight text-primary md:text-display-lg">
            A lifetime of Kathak,
            <br className="hidden md:block" /> kept in one folio
          </h1>
          <p className="mx-auto mb-12 max-w-2xl font-serif text-body-lg italic text-on-surface-variant">
            Compositions, riyaz, performances, and every correction your guru
            gives — preserved in one timeless manuscript that grows with you.
          </p>

          <div className="flex flex-col items-center justify-center gap-6 md:flex-row">
            <Link href="/sign-up" className="w-full md:w-auto">
              <MaroonButton variant="filled" className="w-full md:w-auto">
                Begin Your Manuscript
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
          <span className="animate-bounce text-secondary">
            <Icon.ChevronDown size={22} />
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-margin-mobile md:px-margin-page">
        {/* Philosophy pillars */}
        <section className="py-section-gap">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {pillars.map((p) => (
              <div key={p.title} className="text-center md:text-left">
                <span className="inline-flex text-secondary">
                  <p.Icon size={32} />
                </span>
                <h3 className="mt-4 font-display text-headline-md text-primary">
                  {p.title}
                </h3>
                <p className="mt-3 font-serif text-body-md leading-relaxed text-on-surface-variant">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <ManuscriptBreak />

        {/* What lives inside */}
        <section className="py-section-gap">
          <div className="mb-16 text-center">
            <p className="font-serif text-label-md uppercase tracking-[0.3em] text-secondary">
              What lives inside
            </p>
            <h2 className="mt-3 font-display text-display-lg-mobile text-primary">
              Every folio of your art
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((card) => (
              <OrnamentalFrame
                key={card.title}
                className="h-full bg-surface-container-low transition-colors duration-500 hover:bg-surface-container"
              >
                <div className="flex h-full flex-col items-center p-8 text-center">
                  <div className="mb-5 text-secondary">
                    <card.Icon size={44} />
                  </div>
                  <h3 className="mb-3 font-display text-headline-md text-primary">
                    {card.title}
                  </h3>
                  <p className="font-serif text-body-md leading-relaxed text-on-surface-variant">
                    {card.body}
                  </p>
                </div>
              </OrnamentalFrame>
            ))}
          </div>
        </section>

        {/* Tools no notes app has */}
        <section className="py-section-gap">
          <div className="relative border border-secondary bg-surface-container-low p-2">
            <div
              className="pointer-events-none absolute"
              style={{ top: 6, left: 6, right: 6, bottom: 6, border: "0.5px solid #4e0616" }}
              aria-hidden
            />
            <div className="relative p-8 md:p-14">
              <div className="mb-12 text-center">
                <p className="font-serif text-label-md uppercase tracking-[0.3em] text-secondary">
                  For the craft itself
                </p>
                <h2 className="mt-3 font-display text-display-lg-mobile text-primary">
                  Tools no notes app has
                </h2>
                <p className="mx-auto mt-4 max-w-2xl font-serif text-body-lg italic text-on-surface-variant">
                  Built for the mathematics of laya — the reckonings a dancer
                  works out on paper before every composition.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                {tools.map((t) => (
                  <div key={t.title} className="text-center">
                    <span className="inline-flex text-secondary">
                      <t.Icon size={40} />
                    </span>
                    <h3 className="mt-4 font-display text-headline-md text-primary">
                      {t.title}
                    </h3>
                    <p className="mt-3 font-serif text-body-md leading-relaxed text-on-surface-variant">
                      {t.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Lineage */}
        <section className="flex flex-col items-center gap-16 py-section-gap md:flex-row">
          <div className="flex-1 space-y-6">
            <h2 className="font-display text-headline-lg italic text-primary underline decoration-secondary decoration-1 underline-offset-8">
              The Wisdom of Lineages
            </h2>
            <p className="font-serif text-body-lg leading-loose text-on-surface">
              In Kathak, knowledge is oral — passed in whispers from Guru to
              Shishya. Kathak Journal is a sanctuary for these ephemeral
              teachings, so the nuances of your gharana are never lost to time.
            </p>
            <div className="flex items-center gap-4 italic text-secondary">
              <Icon.Quill size={22} />
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
              <LotusBloom className="relative text-primary" size={240} />
              <div className="absolute left-3 top-3 text-secondary opacity-70">
                <CornerFlourish size={48} />
              </div>
              <div className="absolute bottom-3 right-3 rotate-180 text-secondary opacity-70">
                <CornerFlourish size={48} />
              </div>
            </div>
          </OrnamentalFrame>
        </section>

        {/* Closing CTA */}
        <section className="pb-section-gap">
          <div className="mx-auto max-w-3xl border-y border-secondary py-16 text-center">
            <div className="mb-6 flex justify-center text-secondary opacity-80">
              <LotusBloom size={72} />
            </div>
            <h2 className="font-display text-display-lg-mobile text-primary">
              Begin your manuscript
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-serif text-body-lg italic text-on-surface-variant">
              The first folio is always blank. Inscribe one bol today, and let
              the years fill the rest.
            </p>
            <div className="mt-10 flex justify-center">
              <Link href="/sign-up">
                <MaroonButton variant="filled">Begin Your Manuscript</MaroonButton>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
