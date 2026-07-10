import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateProfile } from "@/lib/profile";
import { Icon } from "@/components/manuscript/Icons";
import { ManuscriptBreak } from "@/components/manuscript/ManuscriptBreak";
import { GHARANA_LABELS, type Gharana } from "@/lib/db/types";

export const metadata = {
  title: "Lineage | Kathak Journal",
};

type GuruNode = {
  name: string;
  compositions: number;
  teachings: number;
  gharanas: Set<Gharana>;
};

export default async function LineagePage() {
  let displayName: string | null = null;
  let primaryGuru: string | null = null;
  let primaryGharana: Gharana | null = null;
  const gurus = new Map<string, GuruNode>();

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { userId } = await auth();
    if (userId) {
      const supabase = await createClient();
      const [profile, compsRes, wisdomRes] = await Promise.all([
        getOrCreateProfile(userId),
        supabase.from("compositions").select("guru_name, gharana"),
        supabase.from("guru_wisdom").select("attribution"),
      ]);

      displayName = profile?.display_name ?? null;
      primaryGuru = profile?.primary_guru ?? null;
      primaryGharana = profile?.gharana ?? null;

      const touch = (name: string | null, gharana: Gharana | null) => {
        const clean = name?.trim();
        if (!clean) return null;
        const node =
          gurus.get(clean) ??
          ({ name: clean, compositions: 0, teachings: 0, gharanas: new Set() } as GuruNode);
        if (gharana) node.gharanas.add(gharana);
        gurus.set(clean, node);
        return node;
      };

      if (primaryGuru) touch(primaryGuru, primaryGharana);

      for (const row of (compsRes.data ?? []) as {
        guru_name: string | null;
        gharana: Gharana | null;
      }[]) {
        const node = touch(row.guru_name, row.gharana);
        if (node) node.compositions += 1;
      }

      for (const row of (wisdomRes.data ?? []) as {
        attribution: string | null;
      }[]) {
        const node = touch(row.attribution, null);
        if (node) node.teachings += 1;
      }
    }
  }

  const guruList = Array.from(gurus.values()).sort(
    (a, b) =>
      b.compositions + b.teachings - (a.compositions + a.teachings) ||
      a.name.localeCompare(b.name)
  );

  return (
    <main className="mx-auto max-w-4xl px-margin-mobile py-12 md:px-margin-page">
      <header className="mb-10 text-center">
        <div className="mb-3 flex justify-center text-secondary">
          <Icon.Peacock size={44} />
        </div>
        <p className="font-deva text-headline-md text-secondary">परम्परा</p>
        <h1 className="mt-1 font-display text-display-lg-mobile text-primary md:text-display-lg">
          Your Lineage
        </h1>
        <p className="mt-4 font-serif text-body-lg italic text-on-surface-variant">
          The gurus and gharanas woven through your compositions and teachings.
        </p>
      </header>

      {guruList.length === 0 ? (
        <div className="mx-auto max-w-xl border border-outline-variant bg-surface-container-lowest p-10 text-center">
          <h2 className="font-display text-headline-md text-primary">
            Your lineage waits to be drawn
          </h2>
          <p className="mt-3 font-serif text-body-md italic text-on-surface-variant">
            Name a guru on your{" "}
            <Link href="/compositions" className="text-secondary underline">
              compositions
            </Link>{" "}
            and{" "}
            <Link href="/wisdom" className="text-secondary underline">
              teachings
            </Link>
            , and this tree will grow of its own accord.
          </p>
        </div>
      ) : (
        <>
          {/* The dancer */}
          <div className="flex flex-col items-center">
            <div className="border border-secondary bg-surface px-8 py-4 text-center">
              <p className="font-serif text-label-md uppercase tracking-widest text-secondary">
                The dancer
              </p>
              <p className="font-display text-headline-md text-primary">
                {displayName || "You"}
              </p>
              {primaryGharana ? (
                <p className="font-serif text-body-md italic text-on-surface-variant">
                  {GHARANA_LABELS[primaryGharana]}
                </p>
              ) : null}
            </div>
            <div className="h-10 w-px bg-secondary" aria-hidden />
          </div>

          <ManuscriptBreak />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {guruList.map((g) => (
              <article
                key={g.name}
                className="border border-outline-variant bg-surface-container-lowest p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="text-secondary">
                    <Icon.Lotus size={28} />
                  </span>
                  <div>
                    <h3 className="font-display text-headline-md text-primary">
                      {g.name}
                      {primaryGuru && g.name === primaryGuru.trim() ? (
                        <span className="ml-2 align-middle font-serif text-label-md uppercase tracking-widest text-secondary">
                          · primary
                        </span>
                      ) : null}
                    </h3>
                    {g.gharanas.size > 0 ? (
                      <p className="font-serif text-body-md italic text-on-surface-variant">
                        {Array.from(g.gharanas)
                          .map((gh) => GHARANA_LABELS[gh])
                          .join(" · ")}
                      </p>
                    ) : null}
                  </div>
                </div>
                <p className="mt-4 font-serif text-body-md text-on-surface-variant">
                  {g.compositions > 0 ? (
                    <>
                      <span className="font-display text-headline-md text-primary">
                        {g.compositions}
                      </span>{" "}
                      {g.compositions === 1 ? "composition" : "compositions"}
                    </>
                  ) : null}
                  {g.compositions > 0 && g.teachings > 0 ? " · " : ""}
                  {g.teachings > 0 ? (
                    <>
                      <span className="font-display text-headline-md text-primary">
                        {g.teachings}
                      </span>{" "}
                      {g.teachings === 1 ? "teaching" : "teachings"}
                    </>
                  ) : null}
                </p>
              </article>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
