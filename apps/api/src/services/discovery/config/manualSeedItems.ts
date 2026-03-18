import type { DiscoveryPlatform } from './whitelistSources';
import type { PatternKey } from './patternTags';

export interface ManualSeedItem {
  platform: DiscoveryPlatform;
  url: string;
  title?: string;
  creatorName?: string;
  thumbnailUrl?: string;
  publishedAt?: string; // ISO
  pattern: PatternKey;
}

// v1: 手動 seed（URL + 最低限メタ）をコード管理する。
// 将来は sources + crawler で自動補完し、この seed は "manual_seed" モードとして残す。
export const MANUAL_SEED_ITEMS: ManualSeedItem[] = [
  // ── Pattern A: 旬と素材の物語 ──────────────────────────────────────────────
  {
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=AKJtVpQnR3w',
    title: 'たけのこご飯の作り方・春の炊き込みご飯',
    creatorName: '白ごはん.com',
    pattern: 'A',
  },
  {
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=BLm8eRqWX5s',
    title: '春キャベツとベーコンのスープ・一汁一菜の朝ごはん',
    creatorName: '有賀薫',
    pattern: 'A',
  },
  {
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=CP9nFsWv74m',
    title: 'アジの捌き方と南蛮漬け・旬の魚を丸ごと使う',
    creatorName: 'ひろさんキッチン',
    pattern: 'A',
  },
  {
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=DQ7gHxUk82n',
    title: '菜の花の辛子和え・春野菜の副菜レシピ',
    creatorName: 'NHKきょうの料理 公式',
    pattern: 'A',
  },
  {
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=EH2kMzVj91o',
    title: 'ふきのとう味噌の作り方・春の保存食',
    creatorName: '白ごはん.com',
    pattern: 'A',
  },

  // ── Pattern B: 隣国・隣文化の食卓 ──────────────────────────────────────────
  {
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=FJ3nNwYk05p',
    title: '本格ビビンバ・韓国家庭料理の作り方',
    creatorName: 'Koh Kentetsu Kitchen',
    pattern: 'B',
  },
  {
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=GK4oQxL16q',
    title: '3種のスパイスで作るチキンカレー・スパイス入門',
    creatorName: '印度カリー子',
    pattern: 'B',
  },
  {
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=HL5pRyM27r',
    title: 'スペイン風トルティーヤ・卵とじゃがいものオムレツ',
    creatorName: 'ワタナベマキ',
    pattern: 'B',
  },
  {
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=IM6qSzN38s',
    title: '台湾風魯肉飯（ルーローハン）・日本の材料で作る',
    creatorName: '我が家の台湾料理 Yuuka Chen',
    pattern: 'B',
  },
  {
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=JN7rTwO49t',
    title: 'ひよこ豆のサブジ・インドの副菜レシピ',
    creatorName: '印度カリー子',
    pattern: 'B',
  },
  {
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=KO8sUxP50u',
    title: '韓国の春雨炒め チャプチェ・本場の味',
    creatorName: 'Koh Kentetsu Kitchen',
    pattern: 'B',
  },
  {
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=UY8eHhZ50E',
    title: 'チュニジア家庭料理「クスクス」・大使館シェフが教える本場の味',
    creatorName: '大使館シェフのおいしいレシピ',
    pattern: 'B',
  },

  // ── Pattern C: 技術と知識の一段深み ────────────────────────────────────────
  {
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=LP9tVyQ61v',
    title: '鶏むね肉を柔らかく仕上げる下処理・プロの技法',
    creatorName: 'COCOCOROチャンネル',
    pattern: 'C',
  },
  {
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=MQ0wZzR72w',
    title: '一番だしの引き方・かつおと昆布の合わせだし',
    creatorName: '白ごはん.com',
    pattern: 'C',
  },
  {
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=NR1xAaS83x',
    title: '自家製味噌の仕込み方・大豆から作る発酵食品',
    creatorName: 'マルカワみそ公式',
    pattern: 'C',
  },
  {
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=OS2yBbT94y',
    title: 'ブレゼで仕上げる豚バラ角煮・火入れの科学',
    creatorName: 'COCOCOROチャンネル',
    pattern: 'C',
  },

  // ── Pattern D: 平日の現実に寄り添う再現性 ──────────────────────────────────
  {
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=PT3zCcU05z',
    title: '至高の豚バラ大根・15分で作る本格煮物',
    creatorName: '料理研究家リュウジのバズレシピ',
    pattern: 'D',
  },
  {
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=QU4aDdV16A',
    title: '前日の残り物で作るバランス弁当・3品10分',
    creatorName: 'にぎりっ娘。',
    pattern: 'D',
  },
  {
    platform: 'instagram',
    url: 'https://www.instagram.com/p/C8mP3rAtW7v/',
    title: '帰ってすぐ作れる一汁三菜・平日30分レシピ',
    creatorName: 'mariko',
    pattern: 'D',
  },
  {
    platform: 'instagram',
    url: 'https://www.instagram.com/p/D9nQ4sBuX8w/',
    title: '疲れた夜でも15分で完成する豚こま炒め',
    creatorName: 'まみ',
    pattern: 'D',
  },
  {
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=RV5bEeW27B',
    title: '悪魔のおにぎり・止まらない旨さのコンビニ超え',
    creatorName: '料理研究家リュウジのバズレシピ',
    pattern: 'D',
  },
  {
    platform: 'instagram',
    url: 'https://www.instagram.com/p/E0oR5tCvY9x/',
    title: '1週間3500円の節約献立・まとめ買いで乗り切る',
    creatorName: 'りなてぃ',
    pattern: 'D',
  },

  // ── Pattern E: ちょっと特別な日の一品 ──────────────────────────────────────
  {
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=SW6cFfX38C',
    title: '週末の贅沢フレンチトースト・バニラクリームがけ',
    creatorName: 'はるあん',
    pattern: 'E',
  },
  {
    platform: 'instagram',
    url: 'https://www.instagram.com/p/F1pS6uDwZ0y/',
    title: 'おもてなしアペリティフプレート・彩りの前菜',
    creatorName: 'Tastemade Japan',
    pattern: 'E',
  },
  {
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=TX7dGgY49D',
    title: '地中海風前菜プレート・スペイン惣菜の盛り合わせ',
    creatorName: 'ワタナベマキ',
    pattern: 'E',
  },
];
