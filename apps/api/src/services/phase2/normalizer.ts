import { z } from 'zod';

import { StructuredRecipe } from './claudeClient';

export interface NormalizedRecipe {
  ingredients: Array<{
    name: string;
    amount?: string;
    unit?: string;
    isSubstituted: boolean;
  }>;
  steps: Array<{
    order: number;
    text: string;
  }>;
  tags: string[];
  cookTimeMinutes?: number;
  confidenceScore: number;
  isUnconfirmed: boolean;
}

const NormalizedIngredientSchema = z.object({
  name: z.string().min(1),
  amount: z.string().optional(),
  unit: z.string().optional(),
  confidence: z.number().min(0).max(1).default(1),
});

const NormalizedStepSchema = z.object({
  order: z.number().int().positive(),
  text: z.string().min(1),
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
  const validatedIngredients = raw.ingredients
    .map((ing) => NormalizedIngredientSchema.safeParse(ing))
    .filter((r) => r.success)
    .map((r) => r.data!);

  const validatedSteps = raw.steps
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
      isSubstituted: false,
    })),
    steps: validatedSteps,
    tags: raw.tags.filter((t) => typeof t === 'string'),
    cookTimeMinutes: raw.cookTimeMinutes ?? undefined,
    confidenceScore,
    isUnconfirmed,
  };
}
