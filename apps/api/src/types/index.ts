export interface Ingredient {
  name: string;
  amount?: string;
  unit?: string;
  isSubstituted?: boolean;
}

export interface Step {
  order: number;
  text: string;
}

export type RecipePhase = 'phase1' | 'phase2' | 'manual';
export type ExtractionStatus = 'pending' | 'done' | 'failed';
export type SourceType = 'youtube' | 'instagram';

export interface Recipe {
  id: string;
  userId: string;
  title: string;
  sourceUrl: string;
  sourceType: SourceType;
  creatorName?: string;
  thumbnailUrl?: string;
  cookTimeMinutes?: number;
  phase: RecipePhase;
  extractionStatus: ExtractionStatus;
  ingredients: Ingredient[];
  steps: Step[];
  tags: string[];
  createdAt: string;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  isAuto: boolean;
  createdAt: string;
}

export interface CookingRecord {
  id: string;
  userId: string;
  recipeId: string;
  cookedAt: string;
  note?: string;
}
