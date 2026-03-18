import { describe, it, expect } from '@jest/globals';

import { normalizeRecipe, NormalizedRecipe } from '../normalizer';
import type { StructuredRecipe } from '../claudeClient';

const VALID_RAW: StructuredRecipe = {
  ingredients: [
    { name: '鶏もも肉', amount: '300', unit: 'g', confidence: 1.0 },
    { name: '大葉', amount: '10', unit: '枚', confidence: 0.9 },
  ],
  steps: [
    { order: 2, text: 'フライパンで炒める' },
    { order: 1, text: '鶏肉を切る' },
  ],
  tags: ['時短', '作り置き'],
  cookTimeMinutes: 30,
};

describe('normalizeRecipe', () => {
  describe('normalizeRecipe — happy path', () => {
    it('全フィールドが揃ったStructuredRecipeを正規化できる', () => {
      const result: NormalizedRecipe = normalizeRecipe(VALID_RAW);

      expect(result.ingredients).toHaveLength(2);
      expect(result.steps).toHaveLength(2);
      expect(result.tags).toEqual(['時短', '作り置き']);
      expect(result.cookTimeMinutes).toBe(30);
    });

    it('ingredients の amount/unit が結果に保持される', () => {
      const result = normalizeRecipe(VALID_RAW);

      expect(result.ingredients[0]).toMatchObject({
        name: '鶏もも肉',
        amount: '300',
        unit: 'g',
      });
      expect(result.ingredients[1]).toMatchObject({
        name: '大葉',
        amount: '10',
        unit: '枚',
      });
    });

    it('steps が order 昇順にソートされる', () => {
      const result = normalizeRecipe(VALID_RAW);

      expect(result.steps.map((s) => s.order)).toEqual([1, 2]);
      expect(result.steps[0].text).toBe('鶏肉を切る');
      expect(result.steps[1].text).toBe('フライパンで炒める');
    });

    it('無効なタグ（非文字列）はフィルタされる', () => {
      const raw: StructuredRecipe = {
        ...VALID_RAW,
        tags: ['有効', 123 as unknown as string, null as unknown as string],
      };

      const result = normalizeRecipe(raw);

      expect(result.tags).toEqual(['有効']);
    });
  });

  describe('confidenceScore & isUnconfirmed', () => {
    it('全confidence=1.0 の場合 confidenceScore=1.0, isUnconfirmed=false', () => {
      const raw: StructuredRecipe = {
        ...VALID_RAW,
        ingredients: [
          { name: '鶏もも肉', amount: '300', unit: 'g', confidence: 1.0 },
          { name: '大葉', amount: '10', unit: '枚', confidence: 1.0 },
        ],
      };

      const result = normalizeRecipe(raw);

      expect(result.confidenceScore).toBe(1);
      expect(result.isUnconfirmed).toBe(false);
    });

    it('平均confidence=0.79 の場合 isUnconfirmed=true', () => {
      const raw: StructuredRecipe = {
        ...VALID_RAW,
        ingredients: [
          { name: '鶏もも肉', amount: '300', unit: 'g', confidence: 0.8 },
          { name: '大葉', amount: '10', unit: '枚', confidence: 0.78 },
        ],
      };

      const result = normalizeRecipe(raw);

      expect(result.confidenceScore).toBeCloseTo(0.79, 2);
      expect(result.isUnconfirmed).toBe(true);
    });

    it('平均confidence=0.80 の場合 isUnconfirmed=false（境界値）', () => {
      const raw: StructuredRecipe = {
        ...VALID_RAW,
        ingredients: [
          { name: '鶏もも肉', amount: '300', unit: 'g', confidence: 0.8 },
          { name: '大葉', amount: '10', unit: '枚', confidence: 0.8 },
        ],
      };

      const result = normalizeRecipe(raw);

      expect(result.confidenceScore).toBeCloseTo(0.8, 2);
      expect(result.isUnconfirmed).toBe(false);
    });

    it('ingredients が空の場合 confidenceScore=0, isUnconfirmed=true', () => {
      const raw: StructuredRecipe = {
        ...VALID_RAW,
        ingredients: [],
      };

      const result = normalizeRecipe(raw);

      expect(result.confidenceScore).toBe(0);
      expect(result.isUnconfirmed).toBe(true);
      expect(result.ingredients).toHaveLength(0);
    });
  });

  describe('validation', () => {
    it('name が空文字の ingredient は除外される', () => {
      const raw: StructuredRecipe = {
        ...VALID_RAW,
        ingredients: [
          { name: '', amount: '300', unit: 'g', confidence: 1.0 },
          { name: '大葉', amount: '10', unit: '枚', confidence: 1.0 },
        ],
      };

      const result = normalizeRecipe(raw);

      expect(result.ingredients).toHaveLength(1);
      expect(result.ingredients[0].name).toBe('大葉');
    });

    it('order が負の step は除外される', () => {
      const raw: StructuredRecipe = {
        ...VALID_RAW,
        steps: [
          { order: -1, text: '無効なステップ' },
          { order: 1, text: '有効なステップ' },
        ],
      };

      const result = normalizeRecipe(raw);

      expect(result.steps).toHaveLength(1);
      expect(result.steps[0].order).toBe(1);
    });

    it('isSubstituted は常に false で初期化される', () => {
      const raw: StructuredRecipe = {
        ...VALID_RAW,
        ingredients: [
          { name: '鶏もも肉', amount: '300', unit: 'g', confidence: 1.0 },
        ],
      };

      const result = normalizeRecipe(raw);

      expect(result.ingredients[0].isSubstituted).toBe(false);
    });
  });
});

