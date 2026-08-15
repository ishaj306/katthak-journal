import { z } from "zod";
import { LAYA_VALUES, TALAS, type Laya } from "@/lib/talas";

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

export type Profile = {
  id: string;
  display_name: string | null;
  dance_start_date: string | null;
  bio: string | null;
  avatar_url: string | null;
  primary_guru: string | null;
  gharana: Gharana | null;
  city: string | null;
  country: string | null;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
};

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
  /** Built-in taal id from lib/talas.ts, e.g. "teentaal". */
  tala_id: string | null;
  /** Free-text taal name, for taals outside the built-in list. */
  tala_name: string | null;
  matras: number | null;
  lay: Laya | null;
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
  tala_id: z
    .string()
    .nullable()
    .optional()
    .refine(
      (v) => v == null || TALAS.some((t) => t.id === v),
      "Unknown taal"
    ),
  tala_name: z.string().trim().max(120).nullable().optional(),
  matras: z.coerce.number().int().min(1).max(128).nullable().optional(),
  lay: z.enum(LAYA_VALUES).nullable().optional(),
  bols: z.string().max(20_000).nullable().optional(),
  meaning: z.string().max(50_000).nullable().optional(),
  instructions: z.string().max(50_000).nullable().optional(),
  corrections: z.string().max(50_000).nullable().optional(),
});

export type CompositionInput = z.infer<typeof compositionInputSchema>;

// ============================================================
// Exam-level context — a composition's place in the syllabus
// ============================================================

export const EXAM_RELATIONS = [
  "learned_for",
  "revisited",
  "performed_for",
] as const;

export type ExamRelation = (typeof EXAM_RELATIONS)[number];

export const EXAM_RELATION_LABELS: Record<ExamRelation, string> = {
  learned_for: "Learned for",
  revisited: "Revisited for",
  performed_for: "Performed for",
};

/** Suggested levels — a datalist, not a fixed set; any board's syllabus fits. */
export const EXAM_LEVEL_SUGGESTIONS = [
  "Level 1",
  "Level 2",
  "Level 3",
  "Level 4",
  "Level 5",
  "Level 6",
  "Prarambhik",
  "Praveshika",
  "Madhyama",
  "Visharad",
  "Alankar",
] as const;

export type RiyazRecording = {
  id: string;
  user_id: string;
  composition_id: string | null;
  storage_path: string;
  title: string;
  mime_type: string | null;
  file_size: number | null;
  duration_sec: number | null;
  notes: string | null;
  recorded_at: string;
  created_at: string;
  updated_at: string;
};

export type CompositionExamLevel = {
  id: string;
  user_id: string;
  composition_id: string;
  level: string;
  relation: ExamRelation;
  noted_on: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export const examLevelInputSchema = z.object({
  level: z.string().trim().min(1, "A level is required").max(80),
  relation: z.enum(EXAM_RELATIONS),
  noted_on: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  notes: z.string().trim().max(2000).nullable().optional(),
});

export type ExamLevelInput = z.infer<typeof examLevelInputSchema>;

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
  prep_notes: string | null;
  rehearsal_notes: string | null;
  costume_id: string | null;
  reflection_well: string | null;
  reflection_mistakes: string | null;
  reflection_learned: string | null;
  reflection_improve: string | null;
  created_at: string;
  updated_at: string;
};

export const PERFORMANCE_STAGES = [
  "preparation",
  "rehearsal",
  "performance",
] as const;

export type PerformanceStage = (typeof PERFORMANCE_STAGES)[number];

export const PERFORMANCE_STAGE_LABELS: Record<PerformanceStage, string> = {
  preparation: "Preparation",
  rehearsal: "Rehearsal",
  performance: "Performance",
};

export type PerformanceComposition = {
  id: string;
  user_id: string;
  performance_id: string;
  composition_id: string;
  position: number;
  notes: string | null;
  created_at: string;
};

export type PerformanceMedia = {
  id: string;
  performance_id: string;
  user_id: string;
  kind: MediaKind;
  stage: PerformanceStage;
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
  prep_notes: z.string().nullable().optional(),
  rehearsal_notes: z.string().nullable().optional(),
  costume_id: z
    .string()
    .uuid()
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
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

// ============================================================
// Ghungroo Diary — the dancer's bells over the years
// ============================================================

export const GHUNGROO_KINDS = [
  "acquired",
  "restrung",
  "added_bells",
  "first_worn",
  "repair",
  "note",
] as const;

export type GhungrooKind = (typeof GHUNGROO_KINDS)[number];

export const GHUNGROO_KIND_LABELS: Record<GhungrooKind, string> = {
  acquired: "Acquired",
  restrung: "Restrung",
  added_bells: "Added bells",
  first_worn: "First worn",
  repair: "Repair",
  note: "Note",
};

export type GhungrooEntry = {
  id: string;
  user_id: string;
  entry_date: string;
  kind: GhungrooKind;
  title: string | null;
  bell_count: number | null;
  string_material: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export const ghungrooInputSchema = z.object({
  entry_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  kind: z.enum(GHUNGROO_KINDS),
  title: z.string().trim().max(200).nullable().optional(),
  bell_count: z.coerce
    .number()
    .int()
    .min(0)
    .max(2000)
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  string_material: z.string().trim().max(120).nullable().optional(),
  notes: z.string().max(4000).nullable().optional(),
});

export type GhungrooInput = z.infer<typeof ghungrooInputSchema>;

// ============================================================
// Costume & wardrobe log
// ============================================================

export const COSTUME_KINDS = [
  "costume",
  "jewellery",
  "accessory",
  "makeup",
  "other",
] as const;

export type CostumeKind = (typeof COSTUME_KINDS)[number];

export const COSTUME_KIND_LABELS: Record<CostumeKind, string> = {
  costume: "Costume",
  jewellery: "Jewellery",
  accessory: "Accessory",
  makeup: "Makeup",
  other: "Other",
};

export const COSTUME_CONTEXTS = [
  "daily_class",
  "riyaz",
  "rehearsal",
  "exam",
  "performance",
  "other",
] as const;

export type CostumeContext = (typeof COSTUME_CONTEXTS)[number];

export const COSTUME_CONTEXT_LABELS: Record<CostumeContext, string> = {
  daily_class: "Daily class",
  riyaz: "Riyaz",
  rehearsal: "Rehearsal",
  exam: "Exam",
  performance: "Performance",
  other: "Other",
};

export type Costume = {
  id: string;
  user_id: string;
  name: string;
  kind: CostumeKind;
  context: CostumeContext | null;
  color: string | null;
  fabric: string | null;
  occasion: string | null;
  worn_on: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export const costumeInputSchema = z.object({
  name: z.string().trim().min(1, "A name is required").max(200),
  kind: z.enum(COSTUME_KINDS),
  context: z.enum(COSTUME_CONTEXTS).nullable().optional(),
  color: z.string().trim().max(120).nullable().optional(),
  fabric: z.string().trim().max(120).nullable().optional(),
  occasion: z.string().trim().max(200).nullable().optional(),
  worn_on: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  notes: z.string().max(4000).nullable().optional(),
});

export type CostumeInput = z.infer<typeof costumeInputSchema>;



