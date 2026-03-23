export interface VideoChapter {
  title: string;
  seconds: number;
}

export interface RecipeContext {
  title: string;
  rawDescription: string;
  phase1Ingredients: Array<{ name: string }>;
  videoChapters?: VideoChapter[];
}

/**
 * YouTube 説明文のチャプターマーカーを解析する。
 * "0:00 タイトル" や "1:23:45 タイトル" 形式に対応。
 */
export function parseVideoChapters(description: string): VideoChapter[] {
  const chapters: VideoChapter[] = [];
  for (const line of description.split('\n')) {
    const trimmed = line.trim();
    // "0:00", "1:23", "1:23:45" + 半角スペース + タイトル
    const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s+(.+)/);
    if (match) {
      const mins = parseInt(match[1], 10);
      const secs = parseInt(match[2], 10);
      const extraSecs = match[3] ? parseInt(match[3], 10) : 0;
      const title = match[4].trim();
      chapters.push({ title, seconds: mins * 60 + secs + extraSecs });
    }
  }
  return chapters;
}

// Maximum characters of description text sent to the LLM.
// YouTube では説明文＋字幕の両方を渡すため 10000 文字に拡張。
// gpt-4o-mini の 128k context window に対して十分余裕がある。
const MAX_DESCRIPTION_CHARS = 10000;

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

  if (ctx.videoChapters && ctx.videoChapters.length > 0) {
    lines.push('<video_chapters>');
    ctx.videoChapters.forEach(({ title, seconds }) => {
      const m = Math.floor(seconds / 60);
      const s = String(seconds % 60).padStart(2, '0');
      lines.push(`  ${m}:${s} ${title}`);
    });
    lines.push('</video_chapters>');
  }

  lines.push('<description>');
  lines.push(sanitized);
  lines.push('</description>');
  lines.push('</recipe>');

  return lines.join('\n');
}
