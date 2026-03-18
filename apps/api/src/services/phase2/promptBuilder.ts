export interface RecipeContext {
  title: string;
  rawDescription: string;
  phase1Ingredients: Array<{ name: string }>;
}

// Maximum characters of description text sent to Claude
// ~4000 chars ≈ ~1000 tokens — well within the 200k context window
const MAX_DESCRIPTION_CHARS = 4000;

/**
 * Strip noise common in YouTube / Instagram descriptions before sending to Claude.
 * - Removes bare URLs (http/https lines)
 * - Removes timestamp markers like "0:00 イントロ"
 * - Removes lines that are only hashtags
 * - Collapses runs of blank lines to a single blank
 */
function sanitizeDescription(text: string): string {
  return text
    .split('\n')
    .map((line) => line.trim())
    // Drop bare URL lines
    .filter((line) => !/^https?:\/\/\S+$/.test(line))
    // Drop timestamp lines like "0:00", "1:23:45 タイトル"
    .filter((line) => !/^\d{1,2}:\d{2}(:\d{2})?(\s.*)?$/.test(line))
    // Drop hashtag-only lines
    .filter((line) => !/^(#\S+\s*)+$/.test(line))
    .join('\n')
    // Collapse multiple blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Build the user-message content for the Phase 2 Claude call.
 *
 * Security: title and description are placed inside clearly delimited XML-like
 * tags so that instruction-injection attempts in the title/description cannot
 * bleed into the system-prompt layer.
 */
export function buildPhase2Context(ctx: RecipeContext): string {
  const sanitized = sanitizeDescription(ctx.rawDescription).slice(
    0,
    MAX_DESCRIPTION_CHARS
  );

  const lines: string[] = [];

  lines.push('<recipe>');
  lines.push(`<title>${ctx.title.replace(/<|>/g, '')}</title>`);

  if (ctx.phase1Ingredients.length > 0) {
    lines.push('<phase1_ingredients>');
    ctx.phase1Ingredients.forEach((ing) =>
      lines.push(`  - ${ing.name.replace(/<|>/g, '')}`)
    );
    lines.push('</phase1_ingredients>');
  }

  lines.push('<description>');
  lines.push(sanitized);
  lines.push('</description>');
  lines.push('</recipe>');

  return lines.join('\n');
}
