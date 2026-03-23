import { z } from 'zod';

import { StructuredRecipe } from './claudeClient';

export interface NormalizedRecipe {
  ingredients: Array<{
    name: string;
    amount?: string;
    unit?: string;
    alternatives: string[];
    isSubstituted: boolean;
  }>;
  steps: Array<{
    order: number;
    text: string;
    timer_seconds: number | null;
    video_timestamp_seconds: number | null;
  }>;
  tags: string[];
  cookTimeMinutes?: number;
  confidenceScore: number;
  isUnconfirmed: boolean;
}

const NormalizedIngredientSchema = z.object({
  name: z.string().min(1),
  // OpenAI が amount/unit を number や空文字で返すことがあるため、
  // string | number | null | undefined を受け入れて string | undefined に正規化する。
  // amount: 0 は「未指定」として undefined 扱い。
  amount: z
    .union([z.string(), z.number()])
    .nullish()
    .transform((v) => {
      if (v === null || v === undefined) return undefined;
      if (typeof v === 'number') return v === 0 ? undefined : String(v);
      return v.trim() || undefined; // 空文字 → undefined
    }),
  unit: z
    .union([z.string(), z.number()])
    .nullish()
    .transform((v) => {
      if (v === null || v === undefined) return undefined;
      if (typeof v === 'number') return v === 0 ? undefined : String(v);
      return v.trim() || undefined; // 空文字 → undefined
    }),
  // confidence can be null from OpenAI → treat as 1.0
  confidence: z
    .union([z.number(), z.null()])
    .optional()
    .transform((v) => (typeof v === 'number' ? v : 1))
    .pipe(z.number().min(0).max(1)),
  // alternatives can be null from OpenAI → treat as []
  alternatives: z
    .array(z.string())
    .nullish()
    .transform((v) => v ?? []),
});

const NormalizedStepSchema = z.object({
  order: z.number().int().positive(),
  text:  z.string().min(1),
  // Accept null, undefined, or non-positive values and coerce all to null.
  timer_seconds: z
    .union([z.number(), z.null()])
    .optional()
    .transform((v) => (typeof v === 'number' && v > 0 ? v : null))
    .default(null),
  // 動画のチャプタータイムスタンプ（秒）。0秒は有効値（動画冒頭）。
  video_timestamp_seconds: z
    .union([z.number(), z.null()])
    .optional()
    .transform((v) => (typeof v === 'number' && v >= 0 ? v : null))
    .default(null),
});

// Calculate overall confidence as average of individual ingredient confidences
function calculateOverallConfidence(
  ingredients: Array<{ confidence: number }>
): number {
  if (ingredients.length === 0) return 0;
  const sum = ingredients.reduce((acc, ing) => acc + ing.confidence, 0);
  return sum / ingredients.length;
}

export function normalizeRecipe(raw: StructuredRecipe): NormalizedRecipe {
  // OpenAI occasionally returns null instead of [] for empty arrays
  const rawIngredients = Array.isArray(raw.ingredients) ? raw.ingredients : [];
  const rawSteps      = Array.isArray(raw.steps)       ? raw.steps       : [];

  const validatedIngredients = rawIngredients
    .map((ing) => NormalizedIngredientSchema.safeParse(ing))
    .filter((r) => r.success)
    .map((r) => r.data!);

  const validatedSteps = rawSteps
    .map((step) => NormalizedStepSchema.safeParse(step))
    .filter((r) => r.success)
    .map((r) => r.data!)
    .sort((a, b) => a.order - b.order);

  const confidenceScore = calculateOverallConfidence(validatedIngredients);
  // Threshold: if average confidence < 80%, mark as unconfirmed
  const isUnconfirmed = confidenceScore < 0.8;

  return {
    ingredients: validatedIngredients.map((ing) => ({
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      alternatives: ing.alternatives,
      isSubstituted: false,
    })),
    steps: validatedSteps.map((step) => ({
      order: step.order,
      text: step.text,
      timer_seconds: step.timer_seconds,
      video_timestamp_seconds: step.video_timestamp_seconds,
    })),
    tags: raw.tags.filter((t) => typeof t === 'string'),
    cookTimeMinutes: raw.cookTimeMinutes ?? undefined,
    confidenceScore,
    isUnconfirmed,
  };
}
