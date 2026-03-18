export type AutoTagCategory = 'cuisine' | 'ingredients' | 'methods' | 'utility';

export interface AutoTagDictionary {
  cuisine: Record<string, string>;
  ingredients: Record<string, string>;
  methods: Record<string, string>;
  utility: Record<string, string>;
}

// Dictionary-first auto tagging.
// Keys are matched as keywords; values are emitted as hashtags.
export const AUTO_TAG_DICTIONARY: AutoTagDictionary = {
  cuisine: {
    台湾: '#台湾料理',
    韓国: '#韓国料理',
    ベトナム: '#ベトナム料理',
    タイ: '#タイ料理',
    メキシコ: '#メキシコ料理',
    スペイン: '#スペイン料理',
    イタリア: '#イタリア料理',
    フランス: '#フランス料理',
    中東: '#中東料理',
    インド: '#インド料理',
  },
  ingredients: {
    鶏肉: '#鶏肉',
    豚肉: '#豚肉',
    魚: '#魚',
    豆腐: '#豆腐',
    卵: '#卵',
    トマト: '#トマト',
    キャベツ: '#キャベツ',
    きのこ: '#きのこ',
  },
  methods: {
    スープ: '#スープ',
    揚げ: '#揚げ物',
    焼き: '#焼き物',
    煮る: '#煮物',
    蒸し: '#蒸し料理',
    漬け: '#漬け',
    発酵: '#発酵',
  },
  utility: {
    時短: '#時短',
    '10分': '#10分',
    '15分': '#15分',
    '30分': '#30分以内',
    作り置き: '#作り置き',
    弁当: '#弁当',
    節約: '#節約',
    一人暮らし: '#一人暮らし',
    平日: '#平日ごはん',
  },
};

export function entriesByCategory(dictionary: AutoTagDictionary) {
  const categories: AutoTagCategory[] = ['cuisine', 'ingredients', 'methods', 'utility'];
  return categories.flatMap((category) =>
    Object.entries(dictionary[category]).map(([keyword, tag]) => ({
      category,
      keyword,
      tag,
    }))
  );
}

