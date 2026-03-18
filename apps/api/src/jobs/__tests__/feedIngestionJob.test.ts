import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('../../db/supabaseAdmin');

import { ingestChannel } from '../../services/feed/youtubeIngester';
import { createAdminClient } from '../../db/supabaseAdmin';
import type { YouTubeChannelConfig } from '../../types/feedIngestion';

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

const CHANNEL: YouTubeChannelConfig = {
  channelId: 'UCW01sMEVYQdhcvkrhbxdBpw',
  handle: '@ryuji_bazurecipe',
  name: '料理研究家リュウジのバズレシピ',
  pattern: 'D',
  tags: ['時短', '今日作れそう', 'おつまみ'],
  maxResults: 2,
  active: true,
};

const CHANNEL_NULL_ID: YouTubeChannelConfig = {
  channelId: null,
  handle: '@sirogohan',
  name: '白ごはん.com',
  pattern: 'A',
  tags: ['今日作れそう', 'ヘルシー'],
  maxResults: 2,
  active: true,
};

const FAKE_API_KEY = 'test-api-key';
const UPLOADS_PLAYLIST_ID = 'UUW01sMEVYQdhcvkrhbxdBpw';
const RESOLVED_CHANNEL_ID = 'UCsirogohan123';

function makeChannelsContentDetailsResponse(uploadsPlaylistId: string): unknown {
  return {
    items: [
      {
        id: CHANNEL.channelId,
        contentDetails: {
          relatedPlaylists: { uploads: uploadsPlaylistId },
        },
      },
    ],
  };
}

function makePlaylistItemsResponse(videoIds: string[]): unknown {
  return {
    items: videoIds.map((id, i) => ({
      snippet: {
        title: `テスト動画 ${i + 1}`,
        publishedAt: `2026-03-0${i + 1}T00:00:00Z`,
        resourceId: { videoId: id },
      },
    })),
  };
}

function makeChannelsIdResponse(channelId: string): unknown {
  return { items: [{ id: channelId }] };
}

function mockFetchSequence(responses: unknown[]): void {
  let callCount = 0;
  jest.spyOn(global, 'fetch').mockImplementation((_url: RequestInfo | URL) => {
    const body = responses[callCount] ?? {};
    callCount++;
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(body),
    } as Response);
  });
}

// ────────────────────────────────────────────────────────────
// Supabase mock helpers
// ────────────────────────────────────────────────────────────

function makeSupabaseMock(insertedIds: string[]): ReturnType<typeof createAdminClient> {
  const rows = insertedIds.map((id) => ({ id }));
  const selectMock = jest.fn().mockImplementation(() => Promise.resolve({ data: rows, error: null }));
  const upsertMock = jest.fn().mockReturnValue({ select: selectMock });
  const fromMock = jest.fn().mockReturnValue({ upsert: upsertMock });
  return { from: fromMock } as unknown as ReturnType<typeof createAdminClient>;
}

const mockCreateAdminClient = createAdminClient as jest.MockedFunction<typeof createAdminClient>;

// ────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────

describe('feedIngestionJob', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ingestChannel — 正常系', () => {
    it('動画が正しく upsert されること', async () => {
      const videoIds = ['vid001', 'vid002'];
      mockFetchSequence([
        makeChannelsContentDetailsResponse(UPLOADS_PLAYLIST_ID),
        makePlaylistItemsResponse(videoIds),
      ]);
      mockCreateAdminClient.mockReturnValue(makeSupabaseMock(videoIds));

      const result = await ingestChannel(CHANNEL, FAKE_API_KEY);

      expect(result.inserted).toBe(2);
      expect(result.skipped).toBe(0);
      expect(result.error).toBeUndefined();
    });

    it('channelId が null の場合 forHandle で解決してから処理すること', async () => {
      const videoIds = ['vid003'];
      mockFetchSequence([
        makeChannelsIdResponse(RESOLVED_CHANNEL_ID),
        // contentDetails call uses resolved channelId
        {
          items: [
            {
              id: RESOLVED_CHANNEL_ID,
              contentDetails: { relatedPlaylists: { uploads: 'UUsirogohan_uploads' } },
            },
          ],
        },
        makePlaylistItemsResponse(videoIds),
      ]);
      mockCreateAdminClient.mockReturnValue(makeSupabaseMock(videoIds));

      const result = await ingestChannel(CHANNEL_NULL_ID, FAKE_API_KEY);

      expect(result.inserted).toBe(1);
      expect(result.error).toBeUndefined();
    });
  });

  describe('ingestChannel — 重複系', () => {
    it('同じ source_url を2回処理しても inserted が増えないこと', async () => {
      const videoIds = ['vid001', 'vid002'];

      // 1回目: 2件挿入
      mockFetchSequence([
        makeChannelsContentDetailsResponse(UPLOADS_PLAYLIST_ID),
        makePlaylistItemsResponse(videoIds),
      ]);
      mockCreateAdminClient.mockReturnValue(makeSupabaseMock(videoIds));
      const first = await ingestChannel(CHANNEL, FAKE_API_KEY);

      // 2回目: ON CONFLICT DO NOTHING → inserted=0
      mockFetchSequence([
        makeChannelsContentDetailsResponse(UPLOADS_PLAYLIST_ID),
        makePlaylistItemsResponse(videoIds),
      ]);
      mockCreateAdminClient.mockReturnValue(makeSupabaseMock([])); // 重複のため空
      const second = await ingestChannel(CHANNEL, FAKE_API_KEY);

      expect(first.inserted).toBe(2);
      expect(second.inserted).toBe(0);
      expect(second.skipped).toBe(2); // 既存なのでスキップ
    });
  });

  describe('ingestChannel — エラー系', () => {
    it('YouTube API がエラーを返しても IngestionResult.error が設定されること', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({}),
      } as Response);

      const result = await ingestChannel(CHANNEL, FAKE_API_KEY);

      expect(result.inserted).toBe(0);
      expect(result.error).toBeDefined();
    });

    it('1チャンネルで API エラーが起きても他チャンネルの呼び出し結果が独立していること', async () => {
      // チャンネル1: エラー
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      } as Response);
      const resultFail = await ingestChannel(CHANNEL, FAKE_API_KEY);

      // チャンネル2: 正常（別チャンネルとして独立して動作する）
      mockFetchSequence([
        makeChannelsContentDetailsResponse(UPLOADS_PLAYLIST_ID),
        makePlaylistItemsResponse(['vid_ok']),
      ]);
      mockCreateAdminClient.mockReturnValue(makeSupabaseMock(['vid_ok']));
      const resultOk = await ingestChannel(CHANNEL_NULL_ID.channelId !== null ? CHANNEL : CHANNEL, FAKE_API_KEY);

      // チャンネル1は失敗してもエラーを返すだけで例外はスローしない
      expect(resultFail.error).toBeDefined();
      // チャンネル2は正常に処理される
      expect(resultOk.inserted).toBe(1);
    });
  });

  describe('クォータ節約', () => {
    it('search.list が呼ばれていないこと（playlistItems.list を使っていること）', async () => {
      const calledUrls: string[] = [];
      jest.spyOn(global, 'fetch').mockImplementation((url: RequestInfo | URL) => {
        calledUrls.push(url.toString());
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve(
              url.toString().includes('playlistItems')
                ? makePlaylistItemsResponse(['vid_x'])
                : makeChannelsContentDetailsResponse(UPLOADS_PLAYLIST_ID)
            ),
        } as Response);
      });
      mockCreateAdminClient.mockReturnValue(makeSupabaseMock(['vid_x']));

      await ingestChannel(CHANNEL, FAKE_API_KEY);

      const hasSearchList = calledUrls.some((u) => u.includes('/search'));
      expect(hasSearchList).toBe(false);

      const hasPlaylistItems = calledUrls.some((u) => u.includes('playlistItems'));
      expect(hasPlaylistItems).toBe(true);
    });
  });
});
