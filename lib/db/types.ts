import { z } from "zod";

export const COMPOSITION_TYPES = [
  "vandana",
  "amad",
  "tukda",
  "toda",
  "paran",
  "chakradar",
  "tihai",
  "gat_nikas",
  "gat_bhav",
  "kavitt",
  "thaat",
  "other",
] as const;

export type CompositionType = (typeof COMPOSITION_TYPES)[number];

export const COMPOSITION_TYPE_LABELS: Record<CompositionType, string> = {
  vandana: "Vandana",
  amad: "Amad",
  tukda: "Tukda",
  toda: "Toda",
  paran: "Paran",
  chakradar: "Chakradar",
  tihai: "Tihai",
  gat_nikas: "Gat Nikas",
  gat_bhav: "Gat Bhav",
  kavitt: "Kavitt",
  thaat: "Thaat",
  other: "Other",
};

export const GHARANAS = [
  "lucknow",
  "jaipur",
  "banaras",
  "raigarh",
  "other",
] as const;

export type Gharana = (typeof GHARANAS)[number];

export const GHARANA_LABELS: Record<Gharana, string> = {
  lucknow: "Lucknow Gharana",
  jaipur: "Jaipur Gharana",
  banaras: "Banaras Gharana",
  raigarh: "Raigarh Gharana",
  other: "Other",
};

export const MEDIA_KINDS = ["audio", "video", "image", "pdf"] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

export type Composition = {
  id: string;
  user_id: string;
  title: string;
  type: CompositionType;
  gharana: Gharana | null;
  guru_name: string | null;
  date_learned: string | null;
  difficulty: number | null;
  bols: string | null;
  meaning: string | null;
  instructions: string | null;
  corrections: string | null;
  created_at: string;
  updated_at: string;
};

export type CompositionMedia = {
  id: string;
  composition_id: string;
  user_id: string;
  kind: MediaKind;
  storage_path: string;
  title: string | null;
  mime_type: string | null;
  file_size: number | null;
  duration_sec: number | null;
  sort_order: number;
  created_at: string;
};

export const compositionInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  type: z.enum(COMPOSITION_TYPES),
  gharana: z.enum(GHARANAS).nullable().optional(),
  guru_name: z.string().trim().max(200).nullable().optional(),
  date_learned: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  difficulty: z.coerce.number().int().min(1).max(5).nullable().optional(),
  bols: z.string().nullable().optional(),
  meaning: z.string().nullable().optional(),
  instructions: z.string().nullable().optional(),
  corrections: z.string().nullable().optional(),
});

export type CompositionInput = z.infer<typeof compositionInputSchema>;

export type RiyazSession = {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  notes: string | null;
  mood: string | null;
  created_at: string;
  updated_at: string;
};

export const manualSessionSchema = z
  .object({
    started_at: z.string().min(1, "Required"),
    duration_minutes: z.coerce.number().int().min(1).max(24 * 60),
    notes: z.string().nullable().optional(),
  })
  .transform((v) => ({
    ...v,
    duration_seconds: v.duration_minutes * 60,
  }));

export type ManualSessionInput = z.infer<typeof manualSessionSchema>;

// ============================================================
// Phase 4 — The Memory
// ============================================================

export const PERFORMANCE_TYPES = [
  "solo",
  "group",
  "festival",
  "recital",
  "competition",
  "classroom",
  "other",
] as const;

export type PerformanceType = (typeof PERFORMANCE_TYPES)[number];

export const PERFORMANCE_TYPE_LABELS: Record<PerformanceType, string> = {
  solo: "Solo",
  group: "Group",
  festival: "Festival",
  recital: "Recital",
  competition: "Competition",
  classroom: "Classroom",
  other: "Other",
};

export type Performance = {
  id: string;
  user_id: string;
  event_name: string;
  venue: string | null;
  performed_on: string | null;
  type: PerformanceType;
  costume_notes: string | null;
  makeup_notes: string | null;
  reflection_well: string | null;
  reflection_mistakes: string | null;
  reflection_learned: string | null;
  reflection_improve: string | null;
  created_at: string;
  updated_at: string;
};

export type PerformanceMedia = {
  id: string;
  performance_id: string;
  user_id: string;
  kind: MediaKind;
  storage_path: string;
  title: string | null;
  mime_type: string | null;
  file_size: number | null;
  duration_sec: number | null;
  sort_order: number;
  created_at: string;
};

export const performanceInputSchema = z.object({
  event_name: z.string().trim().min(1, "Event name is required").max(200),
  venue: z.string().trim().max(200).nullable().optional(),
  performed_on: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  type: z.enum(PERFORMANCE_TYPES),
  costume_notes: z.string().nullable().optional(),
  makeup_notes: z.string().nullable().optional(),
  reflection_well: z.string().nullable().optional(),
  reflection_mistakes: z.string().nullable().optional(),
  reflection_learned: z.string().nullable().optional(),
  reflection_improve: z.string().nullable().optional(),
});

export type PerformanceInput = z.infer<typeof performanceInputSchema>;

export const WISDOM_CATEGORIES = [
  "correction",
  "advice",
  "philosophy",
  "classroom",
  "lesson",
  "other",
] as const;

export type WisdomCategory = (typeof WISDOM_CATEGORIES)[number];

export const WISDOM_CATEGORY_LABELS: Record<WisdomCategory, string> = {
  correction: "Corrections",
  advice: "Advice",
  philosophy: "Philosophy",
  classroom: "Classroom",
  lesson: "Lessons",
  other: "Other",
};

export type GuruWisdom = {
  id: string;
  user_id: string;
  quote: string;
  attribution: string | null;
  category: WisdomCategory;
  tags: string[];
  captured_at: string | null;
  pinned: boolean;
  created_at: string;
  updated_at: string;
};

export const wisdomInputSchema = z.object({
  quote: z.string().trim().min(1, "The wisdom cannot be empty").max(2000),
  attribution: z.string().trim().max(200).nullable().optional(),
  category: z.enum(WISDOM_CATEGORIES),
  tags: z
    .string()
    .nullable()
    .optional()
    .transform((s) =>
      (s ?? "")
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0)
        .slice(0, 10)
    ),
  captured_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  pinned: z
    .union([z.literal("on"), z.literal("true"), z.boolean()])
    .optional()
    .transform((v) => v === true || v === "on" || v === "true"),
});

export type WisdomInput = z.infer<typeof wisdomInputSchema>;

export type JournalEntry = {
  id: string;
  user_id: string;
  entry_date: string;
  title: string | null;
  body: string | null;
  is_private: boolean;
  created_at: string;
  updated_at: string;
};

export const journalInputSchema = z.object({
  entry_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  title: z.string().trim().max(200).nullable().optional(),
  body: z.string().max(50_000).nullable().optional(),
  is_private: z
    .union([z.literal("on"), z.literal("true"), z.boolean()])
    .optional()
    .transform((v) => v === true || v === "on" || v === "true"),
});

export type JournalInput = z.infer<typeof journalInputSchema>;

// ============================================================
// Phase 5 — The Lineage
// ============================================================

export const QUOTE_CATEGORIES = [
  "philosophy",
  "discipline",
  "performance",
  "masters",
] as const;

export type QuoteCategory = (typeof QUOTE_CATEGORIES)[number];

export const QUOTE_CATEGORY_LABELS: Record<QuoteCategory, string> = {
  philosophy: "Philosophy",
  discipline: "Discipline",
  performance: "Performance",
  masters: "Masters",
};

export type KathakQuote = {
  id: string;
  quote: string;
  attribution: string;
  source: string | null;
  category: string;
  tags: string[];
  created_at: string;
};



