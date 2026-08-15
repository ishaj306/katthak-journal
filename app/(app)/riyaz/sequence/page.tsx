import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { Icon } from "@/components/manuscript/Icons";
import type { Recording, SavedMix } from "@/lib/riyaz-queue";
import { RiyazSequence } from "./_components/RiyazSequence";

export const metadata = {
  title: "Riyaaz Sequence | Kathak Journal",
};

type MediaRow = {
  id: string;
  storage_path: string;
  title: string | null;
  duration_sec: number | null;
  composition: {
    id: string;
    title: string;
    tala_id: string | null;
    tala_name: string | null;
  } | null;
};

export default async function RiyazSequencePage() {
  const { userId } = await auth();
  const supabase = await createClient();

  // Every audio recording the dancer has made, with its composition's taal.
  const { data: mediaRows } = await supabase
    .from("composition_media")
    .select(
      "id, storage_path, title, duration_sec, composition:compositions(id, title, tala_id, tala_name)"
    )
    .eq("kind", "audio")
    .order("created_at", { ascending: false });

  const rows = (mediaRows ?? []) as unknown as MediaRow[];

  // Takes recorded during earlier Riyaaz sessions — so a good take can be
  // pulled back into a new mix, not just replayed on its composition.
  const { data: takeRows } = await supabase
    .from("riyaz_recordings")
    .select("id, storage_path, title, duration_sec, composition_id")
    .order("recorded_at", { ascending: false });

  const takes = (takeRows ?? []) as {
    id: string;
    storage_path: string;
    title: string | null;
    duration_sec: number | null;
    composition_id: string | null;
  }[];

  // Exam levels, so the picker can be separated by level as well as taal.
  const compositionIds = Array.from(
    new Set(
      [
        ...rows.map((r) => r.composition?.id),
        ...takes.map((t) => t.composition_id),
      ].filter(Boolean)
    )
  ) as string[];

  // A take only carries a composition_id, so look up each linked composition's
  // title and taal for grouping.
  const compositionInfo = new Map<
    string,
    { title: string; tala_id: string | null; tala_name: string | null }
  >();
  if (compositionIds.length > 0) {
    const { data: comps } = await supabase
      .from("compositions")
      .select("id, title, tala_id, tala_name")
      .in("id", compositionIds);
    for (const c of (comps ?? []) as {
      id: string;
      title: string;
      tala_id: string | null;
      tala_name: string | null;
    }[]) {
      compositionInfo.set(c.id, {
        title: c.title,
        tala_id: c.tala_id,
        tala_name: c.tala_name,
      });
    }
  }

  const levelsByComposition = new Map<string, string[]>();
  if (compositionIds.length > 0) {
    const { data: levelRows } = await supabase
      .from("composition_exam_levels")
      .select("composition_id, level")
      .in("composition_id", compositionIds);
    for (const row of (levelRows ?? []) as {
      composition_id: string;
      level: string;
    }[]) {
      const list = levelsByComposition.get(row.composition_id) ?? [];
      if (!list.includes(row.level)) list.push(row.level);
      levelsByComposition.set(row.composition_id, list);
    }
  }

  // Sign every storage path (both sources live in the same bucket).
  const urlMap = new Map<string, string>();
  const allPaths = [
    ...rows.map((r) => r.storage_path),
    ...takes.map((t) => t.storage_path),
  ];
  if (allPaths.length > 0) {
    const { data: signed } = await supabase.storage
      .from("composition-media")
      .createSignedUrls(allPaths, 60 * 60);
    for (const s of signed ?? []) {
      if (s.signedUrl) urlMap.set(s.path ?? "", s.signedUrl);
    }
  }

  const fromMedia: Recording[] = rows
    .map((r): Recording | null => {
      const url = urlMap.get(r.storage_path);
      if (!url) return null;
      return {
        id: r.id,
        url,
        title: r.title,
        durationSec: r.duration_sec,
        compositionId: r.composition?.id ?? null,
        compositionTitle: r.composition?.title ?? null,
        talaId: r.composition?.tala_id ?? null,
        talaName: r.composition?.tala_name ?? null,
        levels: r.composition?.id
          ? levelsByComposition.get(r.composition.id) ?? []
          : [],
      };
    })
    .filter((r): r is Recording => r !== null);

  const fromTakes: Recording[] = takes
    .map((t): Recording | null => {
      const url = urlMap.get(t.storage_path);
      if (!url) return null;
      const info = t.composition_id
        ? compositionInfo.get(t.composition_id)
        : undefined;
      return {
        id: t.id,
        url,
        title: t.title ?? "Riyaaz take",
        durationSec: t.duration_sec,
        compositionId: t.composition_id,
        compositionTitle: info?.title ?? null,
        talaId: info?.tala_id ?? null,
        talaName: info?.tala_name ?? null,
        levels: t.composition_id
          ? levelsByComposition.get(t.composition_id) ?? []
          : [],
      };
    })
    .filter((r): r is Recording => r !== null);

  const recordings: Recording[] = [...fromMedia, ...fromTakes];

  // Saved, named mixes.
  const { data: mixRows } = await supabase
    .from("riyaz_mixes")
    .select("id, name, default_gap, loop, items")
    .order("updated_at", { ascending: false });

  const savedMixes: SavedMix[] = (
    (mixRows ?? []) as {
      id: string;
      name: string;
      default_gap: number;
      loop: SavedMix["loop"];
      items: SavedMix["items"];
    }[]
  ).map((m) => ({
    id: m.id,
    name: m.name,
    defaultGap: m.default_gap,
    loop: m.loop,
    items: Array.isArray(m.items) ? m.items : [],
  }));

  return (
    <main className="mx-auto max-w-6xl px-margin-mobile py-12 md:px-margin-page">
      <Link
        href="/riyaz"
        className="inline-flex items-center gap-2 font-serif text-label-md uppercase tracking-widest text-secondary transition-colors hover:text-primary"
      >
        <Icon.ArrowLeft size={16} />
        Back to Riyaz
      </Link>

      <header className="mt-8 mb-12 text-center">
        <p className="font-deva text-headline-md text-secondary">रियाज़</p>
        <h1 className="mt-1 font-display text-display-lg-mobile text-primary md:text-display-lg">
          Riyaaz Sequence
        </h1>
        <p className="mt-4 font-serif text-body-lg italic text-on-surface-variant">
          Assemble a practice mix from your own recordings and talas — set the
          breathing gaps, then let it carry you through, hands free.
        </p>
      </header>

      <RiyazSequence
        recordings={recordings}
        userId={userId ?? ""}
        savedMixes={savedMixes}
      />
    </main>
  );
}
