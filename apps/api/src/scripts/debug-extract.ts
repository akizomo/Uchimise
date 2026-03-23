/**
 * YouTube 抽出のデバッグスクリプト
 * 使い方: pnpm --filter api exec tsx src/scripts/debug-extract.ts <YouTube URL>
 *
 * 例: pnpm --filter api exec tsx src/scripts/debug-extract.ts "https://youtu.be/4DZVE8LLLKU"
 */

import 'dotenv/config';
import { YoutubeTranscript } from 'youtube-transcript';
import { fetchYouTubeVideo } from '../services/phase1/youtubeClient';
import { roughExtract } from '../services/phase1/roughExtractor';
import { buildPhase2Context } from '../services/phase2/promptBuilder';
import { structureRecipeWithClaude } from '../services/phase2/claudeClient';
import { normalizeRecipe } from '../services/phase2/normalizer';

const url = process.argv[2];
if (!url) {
  console.error('Usage: tsx src/scripts/debug-extract.ts <YouTube URL>');
  process.exit(1);
}

// youtu.be/ID → videoId を抽出
function extractVideoId(u: string): string | null {
  const m = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m?.[1] ?? null;
}

async function main() {
  console.log('\n=== 1. YouTube API + 字幕取得 ===');
  const videoData = await fetchYouTubeVideo(url);
  console.log(`タイトル: ${videoData.title}`);
  console.log(`チャンネル: ${videoData.channelTitle}`);
  console.log(`説明文: ${videoData.description.length} 文字`);
  console.log(`字幕: ${videoData.transcript.length} 文字`);

  if (videoData.description.length > 0) {
    console.log('\n--- 説明文（先頭500文字）---');
    console.log(videoData.description.slice(0, 500));
  }
  if (videoData.transcript.length > 0) {
    console.log('\n--- 字幕（先頭500文字）---');
    console.log(videoData.transcript.slice(0, 500));
  } else {
    console.log('\n⚠️  字幕が取得できませんでした（このビデオは字幕なし、または非対応形式）');

    // 字幕が取れない場合、youtube-transcript の生エラーも確認する
    const videoId = extractVideoId(url);
    if (videoId) {
      console.log('\n--- youtube-transcript 直接テスト ---');
      for (const lang of ['ja', 'ja-JP', undefined]) {
        try {
          const segs = lang
            ? await YoutubeTranscript.fetchTranscript(videoId, { lang })
            : await YoutubeTranscript.fetchTranscript(videoId);
          console.log(`  lang=${lang ?? 'none'}: ${segs.length} セグメント`);
          if (segs.length > 0) console.log(`  先頭: "${segs[0].text}"`);
        } catch (e) {
          console.log(`  lang=${lang ?? 'none'}: エラー → ${(e as Error).message}`);
        }
      }
    }
  }

  console.log('\n=== 2. Phase 1 roughExtract ===');
  const roughInput = videoData.description;
  const extraction = roughExtract(roughInput);
  console.log(`hasIngredientSection: ${extraction.hasIngredientSection}`);
  console.log(`ingredients: ${JSON.stringify(extraction.ingredientNames)}`);
  console.log(`cookTimeMinutes: ${extraction.cookTimeMinutes}`);

  console.log('\n=== 3. Phase 2 プロンプト ===');
  const combinedDescription =
    videoData.transcript && videoData.description
      ? `${videoData.description}\n\n---\n\n${videoData.transcript}`
      : videoData.transcript || videoData.description;

  const context = buildPhase2Context({
    title: videoData.title,
    rawDescription: combinedDescription,
    phase1Ingredients: extraction.ingredientNames.map((name) => ({ name })),
  });
  console.log(`Phase 2 コンテキスト: ${context.length} 文字`);
  console.log('\n--- コンテキスト（先頭1000文字）---');
  console.log(context.slice(0, 1000));

  console.log('\n=== 4. OpenAI Phase 2 実行 ===');
  try {
    const structured = await structureRecipeWithClaude(videoData.title, context);
    console.log(`ingredients（raw）: ${JSON.stringify(structured.ingredients, null, 2)}`);
    console.log(`steps 件数: ${structured.steps.length}`);

    const normalized = normalizeRecipe(structured);
    console.log(`\n--- 正規化後 ---`);
    console.log(`ingredients: ${normalized.ingredients.length} 件`);
    normalized.ingredients.forEach((i, idx) => {
      console.log(`  ${idx + 1}. ${i.name} ${i.amount ?? ''} ${i.unit ?? ''}`);
    });
    console.log(`steps: ${normalized.steps.length} 件`);
  } catch (e) {
    console.error(`OpenAI エラー: ${(e as Error).message}`);
  }
}

main().catch((e) => {
  console.error('スクリプトエラー:', e);
  process.exit(1);
});
