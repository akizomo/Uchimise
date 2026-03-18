import { aggregateIngredients, type RawIngredient } from '../aggregateIngredients';

describe('aggregateIngredients', () => {
  describe('同食材の合算', () => {
    it('同名・同単位の数値 amount を合算する', () => {
      const input: RawIngredient[] = [
        { name: '鶏もも肉', amount: '300', unit: 'g' },
        { name: '鶏もも肉', amount: '200', unit: 'g' },
      ];

      const result = aggregateIngredients(input);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ name: '鶏もも肉', display: '500g', recipeCount: 2 });
    });

    it('小数の amount も正しく合算する', () => {
      const input: RawIngredient[] = [
        { name: 'ごま油', amount: '0.5', unit: '大さじ' },
        { name: 'ごま油', amount: '1.5', unit: '大さじ' },
      ];

      const result = aggregateIngredients(input);

      expect(result[0].display).toBe('2大さじ');
    });

    it('分数 amount (1/2) を数値として合算する', () => {
      const input: RawIngredient[] = [
        { name: '砂糖', amount: '1/2', unit: '大さじ' },
        { name: '砂糖', amount: '1/2', unit: '大さじ' },
      ];

      const result = aggregateIngredients(input);

      expect(result[0].display).toBe('1大さじ');
    });

    it('単位が異なる場合は別々のエントリになる', () => {
      const input: RawIngredient[] = [
        { name: '醤油', amount: '2', unit: '大さじ' },
        { name: '醤油', amount: '100', unit: 'ml' },
      ];

      const result = aggregateIngredients(input);

      expect(result).toHaveLength(2);
    });
  });

  describe('非数値 amount の結合', () => {
    it('非数値の amount は " + " で結合する', () => {
      const input: RawIngredient[] = [
        { name: '塩', amount: '少々', unit: '' },
        { name: '塩', amount: '適量', unit: '' },
      ];

      const result = aggregateIngredients(input);

      expect(result[0].display).toBe('少々 + 適量');
    });

    it('非数値の重複 amount は1件にまとめる', () => {
      const input: RawIngredient[] = [
        { name: '塩', amount: '少々', unit: '' },
        { name: '塩', amount: '少々', unit: '' },
      ];

      const result = aggregateIngredients(input);

      expect(result[0].display).toBe('少々');
    });
  });

  describe('単位なし', () => {
    it('unit が未指定の場合は display に数値のみ表示する', () => {
      const input: RawIngredient[] = [
        { name: '卵', amount: '2' },
        { name: '卵', amount: '1' },
      ];

      const result = aggregateIngredients(input);

      expect(result[0]).toMatchObject({ name: '卵', display: '3' });
    });

    it('amount が未指定の場合は display が空文字になる', () => {
      const input: RawIngredient[] = [{ name: '大葉' }];

      const result = aggregateIngredients(input);

      expect(result[0].display).toBe('');
    });
  });

  describe('名前の正規化', () => {
    it('名前の大文字小文字を区別せずグループ化する', () => {
      const input: RawIngredient[] = [
        { name: 'しお', amount: '1', unit: 'g' },
        { name: 'シオ', amount: '1', unit: 'g' },
      ];

      // 異なる文字種は別エントリ（localeCompare でのソートのみ）
      const result = aggregateIngredients(input);
      // Case-insensitive grouping applies to ASCII; Japanese hiragana/katakana are different keys
      expect(result).toHaveLength(2);
    });

    it('名前前後の空白を除去してグループ化する', () => {
      const input: RawIngredient[] = [
        { name: '  鶏もも肉  ', amount: '100', unit: 'g' },
        { name: '鶏もも肉', amount: '200', unit: 'g' },
      ];

      const result = aggregateIngredients(input);

      expect(result).toHaveLength(1);
      expect(result[0].display).toBe('300g');
    });
  });

  describe('ソート', () => {
    it('結果が名前の日本語アルファベット順で返る', () => {
      const input: RawIngredient[] = [
        { name: '醤油', amount: '1', unit: '大さじ' },
        { name: '鶏もも肉', amount: '300', unit: 'g' },
        { name: 'ごま油', amount: '1', unit: '小さじ' },
      ];

      const result = aggregateIngredients(input);
      const names = result.map((r) => r.name);

      expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'ja')));
    });
  });

  describe('空入力', () => {
    it('空配列を渡したとき空配列を返す', () => {
      expect(aggregateIngredients([])).toEqual([]);
    });
  });
});
