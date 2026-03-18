export interface RoughExtractionResult {
  ingredientNames: string[];
  cookTimeMinutes: number | undefined;
  hasIngredientSection: boolean;
}

// Japanese ingredient list patterns in video descriptions
const INGREDIENT_SECTION_PATTERNS = [
  /【材料[^】]*】([\s\S]*?)(?:【|$)/,
  /■材料[^\n]*([\s\S]*?)(?:■|$)/,
  /◆材料[^\n]*([\s\S]*?)(?:◆|$)/,
  /〈材料〉([\s\S]*?)(?:〈|$)/,
  /＜材料＞([\s\S]*?)(?:＜|$)/,
  /材料[（(（][^)）)]*[)）)]([\s\S]*?)(?:\n\n|$)/,
];

// Ingredient line patterns
const INGREDIENT_LINE_PATTERNS = [
  /^[・•▸▷→]\s*(.+)/,           // ・鶏もも肉 300g
  /^[-−]\s*(.+)/,                 // - 鶏もも肉 300g
  /^([^\s・•\n]{2,8})\s+\d/,     // 鶏もも肉 300g
];

// Cook time patterns
const COOK_TIME_PATTERNS = [
  /(\d+)分で/,
  /(\d+)分程度/,
  /所要時間[：:]\s*(\d+)分/,
  /調理時間[：:]\s*(\d+)分/,
  /時間[：:]\s*(\d+)分/,
];

function extractIngredientSection(text: string): string | null {
  for (const pattern of INGREDIENT_SECTION_PATTERNS) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return null;
}

function parseIngredientLines(section: string): string[] {
  const lines = section.split('\n').map((l) => l.trim()).filter(Boolean);
  const ingredients: string[] = [];

  for (const line of lines) {
    for (const pattern of INGREDIENT_LINE_PATTERNS) {
      const match = line.match(pattern);
      if (match?.[1]) {
        // Extract just the ingredient name (before quantities)
        const name = match[1]
          // Pattern A: number → unit  e.g. "300g", "2個", "10枚"
          .replace(/\s*[\d０-９.\/]+\s*(?:g|ml|個|枚|本|切れ|大さじ|小さじ|カップ).*/i, '')
          // Pattern B: unit → number  e.g. "大さじ2", "小さじ1/2"
          .replace(/\s*(?:大さじ|小さじ|カップ)\s*[\d０-９.\/]+.*/i, '')
          .trim();
        if (name.length >= 2 && name.length <= 15) {
          ingredients.push(name);
        }
        break;
      }
    }
  }

  return [...new Set(ingredients)]; // deduplicate
}

function extractCookTime(text: string): number | undefined {
  for (const pattern of COOK_TIME_PATTERNS) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const minutes = parseInt(match[1], 10);
      if (minutes > 0 && minutes <= 480) return minutes;
    }
  }
  return undefined;
}

export function roughExtract(text: string): RoughExtractionResult {
  const section = extractIngredientSection(text);
  const hasIngredientSection = section !== null;

  const ingredientNames = hasIngredientSection
    ? parseIngredientLines(section)
    : [];

  const cookTimeMinutes = extractCookTime(text);

  return {
    ingredientNames,
    cookTimeMinutes,
    hasIngredientSection,
  };
}
