export interface RawIngredient {
  name: string;
  amount?: string;
  unit?: string;
}

export interface AggregatedIngredient {
  name: string;
  /** Summed display string, e.g. "500g" or "大さじ2 + 大さじ1" */
  display: string;
  /** Number of recipes this ingredient appears in */
  recipeCount: number;
}

/** Try to parse a string as a positive finite number. Returns NaN on failure. */
function parseAmount(raw: string | undefined): number {
  if (!raw) return NaN;
  // Support simple fractions like "1/2"
  const fraction = raw.match(/^(\d+)\/(\d+)$/);
  if (fraction) return Number(fraction[1]) / Number(fraction[2]);
  const n = parseFloat(raw.replace(/,/g, ''));
  return isFinite(n) && n > 0 ? n : NaN;
}

/** Format a number compactly: drop trailing zeros after decimal point. */
function formatNumber(n: number): string {
  // Up to 2 decimal places, stripping trailing zeros
  return parseFloat(n.toFixed(2)).toString();
}

/**
 * Aggregate a flat list of ingredients across multiple recipes.
 * Rules:
 *  - Group by (name, unit) — case-insensitive name trim
 *  - If all amounts in a group are numeric → sum them
 *  - If amounts are mixed (some non-numeric) → concatenate with " + "
 *  - No unit → group by name only, apply same rules
 *
 * Example:
 *   [{ name:"鶏もも肉", amount:"300", unit:"g" },
 *    { name:"鶏もも肉", amount:"200", unit:"g" }]
 *   → { name:"鶏もも肉", display:"500g", recipeCount:2 }
 */
export function aggregateIngredients(
  ingredients: RawIngredient[]
): AggregatedIngredient[] {
  // key = `name\x00unit` (NUL separator avoids false collisions)
  const groups = new Map<
    string,
    { name: string; unit: string; amounts: string[]; recipeCount: number }
  >();

  for (const ing of ingredients) {
    const name = ing.name.trim();
    const unit = (ing.unit ?? '').trim();
    const key = `${name.toLowerCase()}\x00${unit.toLowerCase()}`;

    const existing = groups.get(key);
    if (existing) {
      existing.amounts.push(ing.amount ?? '');
      existing.recipeCount += 1;
    } else {
      groups.set(key, {
        name,
        unit,
        amounts: [ing.amount ?? ''],
        recipeCount: 1,
      });
    }
  }

  const result: AggregatedIngredient[] = [];

  for (const { name, unit, amounts, recipeCount } of groups.values()) {
    const parsed = amounts.map(parseAmount);
    const allNumeric = parsed.every((n) => !isNaN(n));

    let display: string;
    if (allNumeric) {
      const sum = parsed.reduce((acc, n) => acc + n, 0);
      display = unit ? `${formatNumber(sum)}${unit}` : formatNumber(sum);
    } else {
      // Fall back: show unique non-empty amounts joined with " + "
      const unique = [...new Set(amounts.filter(Boolean))];
      if (unique.length === 0) {
        display = unit || '';
      } else {
        display = unique.map((a) => (unit ? `${a}${unit}` : a)).join(' + ');
      }
    }

    result.push({ name, display, recipeCount });
  }

  // Sort: alphabetical by name for a stable, scannable list
  result.sort((a, b) => a.name.localeCompare(b.name, 'ja'));

  return result;
}
