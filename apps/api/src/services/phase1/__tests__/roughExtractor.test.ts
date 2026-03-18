import { describe, it, expect } from '@jest/globals';

import { roughExtract } from '../roughExtractor';

const FIXTURE_YOUTUBE_DESC = `
簡単おいしい！鶏もも肉と大葉のさっぱり炒め
30分で完成する時短レシピです。

【材料（2人分）】
・鶏もも肉 300g
・大葉 10枚
・醤油 大さじ2
・みりん 大さじ1
・ごま油 小さじ1

【手順】
1. 鶏肉を一口大に切る
2. フライパンで炒める
`;

describe('roughExtractor', () => {
  describe('ingredientSection extraction', () => {
    it('【材料】セクションから材料名を抽出する', () => {
      const result = roughExtract(FIXTURE_YOUTUBE_DESC);

      expect(result.hasIngredientSection).toBe(true);
      expect(result.ingredientNames).toEqual(['鶏もも肉', '大葉', '醤油', 'みりん', 'ごま油']);
    });

    it('■材料 セクション（全角スペース）から材料名を抽出する', () => {
      const text = `
タイトル

■材料　（2人分）
・玉ねぎ 1個
・にんじん 1本

■手順
1. 切る
`;

      const result = roughExtract(text);

      expect(result.hasIngredientSection).toBe(true);
      expect(result.ingredientNames).toEqual(['玉ねぎ', 'にんじん']);
    });

    it('材料（2人分）形式から材料名を抽出する', () => {
      const text = `
タイトル

材料（2人分）
・じゃがいも 2個
・ベーコン 50g

`;

      const result = roughExtract(text);

      expect(result.hasIngredientSection).toBe(true);
      expect(result.ingredientNames).toEqual(['じゃがいも', 'ベーコン']);
    });

    it('セクションなしのテキストでは hasIngredientSection が false になる', () => {
      const text = `
これは材料セクションを含まない説明文です。
・ただの箇条書き
・テストデータ
`;

      const result = roughExtract(text);

      expect(result.hasIngredientSection).toBe(false);
      expect(result.ingredientNames).toEqual([]);
    });

    it('空文字列では空配列と hasIngredientSection=false を返す', () => {
      const result = roughExtract('');

      expect(result.hasIngredientSection).toBe(false);
      expect(result.ingredientNames).toEqual([]);
      expect(result.cookTimeMinutes).toBeUndefined();
    });
  });

  describe('ingredientLine parsing', () => {
    it('・印の行から品名を取り出す（分量を含む行）', () => {
      const text = `
【材料】
・鶏もも肉 300g
・大葉 10枚
`;

      const result = roughExtract(text);

      expect(result.ingredientNames).toEqual(['鶏もも肉', '大葉']);
    });

    it('数値＋単位を除いた品名だけを返す（鶏もも肉300g → 鶏もも肉）', () => {
      const text = `
【材料】
・鶏もも肉300g
・大葉10枚
`;

      const result = roughExtract(text);

      expect(result.ingredientNames).toEqual(['鶏もも肉', '大葉']);
    });

    it('2文字未満の品名は無視する', () => {
      const text = `
【材料】
・卵 1個
・塩 3g
`;

      const result = roughExtract(text);

      // 「卵」「塩」は1文字なので除外される（分量除去後に1文字未満フィルタが効く）
      expect(result.ingredientNames).toEqual([]);
    });

    it('重複する材料名は1件にまとめる', () => {
      const text = `
【材料】
・鶏もも肉 300g
・鶏もも肉 200g
`;

      const result = roughExtract(text);

      expect(result.ingredientNames).toEqual(['鶏もも肉']);
    });
  });

  describe('cookTime extraction', () => {
    it('"30分で完成" から 30 を返す', () => {
      const text = 'このレシピは30分で完成します。';

      const result = roughExtract(text);

      expect(result.cookTimeMinutes).toBe(30);
    });

    it('"調理時間：45分" から 45 を返す', () => {
      const text = '調理時間：45分 で作れます。';

      const result = roughExtract(text);

      expect(result.cookTimeMinutes).toBe(45);
    });

    it('481分以上の値は返さない（異常値除外）', () => {
      const text = '調理時間：481分 かかります。';

      const result = roughExtract(text);

      expect(result.cookTimeMinutes).toBeUndefined();
    });

    it('調理時間の記載がない場合は undefined を返す', () => {
      const text = 'これは時間の記載がない説明文です。';

      const result = roughExtract(text);

      expect(result.cookTimeMinutes).toBeUndefined();
    });
  });
});

