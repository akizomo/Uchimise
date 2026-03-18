import type { PatternKey } from './patternTags';

export type DiscoveryPlatform =
  | 'youtube'
  | 'instagram'
  | 'recipe_site'
  | 'note'
  | 'web';

export type CrawlPriority = 'high' | 'medium' | 'low';

export interface WhitelistSource {
  id: string;
  platform: DiscoveryPlatform;
  url: string;
  title: string;
  active: boolean;
  priority: CrawlPriority;
  crawlPriority: number; // higher = crawl first (derived from priority)
  patternCandidates: PatternKey[];
  fixedTags: string[];
  countryContext?: string;
  language?: string;
}

function toCrawlPriority(priority: CrawlPriority): number {
  switch (priority) {
    case 'high':
      return 90;
    case 'medium':
      return 60;
    case 'low':
      return 30;
    default: {
      const _exhaustive: never = priority;
      return _exhaustive;
    }
  }
}

// v1: keep as code-config so it can be versioned and reviewed.
export const WHITELIST_SOURCES: WhitelistSource[] = [
  {
    id: 'shirogohancom_youtube',
    platform: 'youtube',
    title: '白ごはん.com',
    url: 'https://www.youtube.com/@sirogohancom',
    active: true,
    priority: 'high',
    crawlPriority: toCrawlPriority('high'),
    patternCandidates: ['A', 'C'],
    fixedTags: ['#今日の旬', '#ちゃんと覚えたい', '#和食', '#基本'],
    countryContext: 'JP',
    language: 'ja',
  },
  {
    id: 'shirogohancom_instagram',
    platform: 'instagram',
    title: '白ごはん.com Instagram',
    url: 'https://www.instagram.com/tomita_tadasuke/',
    active: true,
    priority: 'medium',
    crawlPriority: toCrawlPriority('medium'),
    patternCandidates: ['A', 'C'],
    countryContext: 'JP',
    language: 'ja',
    fixedTags: ['#今日の旬', '#ちゃんと覚えたい', '#和食', '#旬'],
  },
  {
    id: 'kaorun_note',
    platform: 'note',
    title: '有賀薫 Note',
    url: 'https://note.com/kaorun',
    active: true,
    priority: 'medium',
    crawlPriority: toCrawlPriority('medium'),
    patternCandidates: ['A'],
    countryContext: 'JP',
    language: 'ja',
    fixedTags: ['#今日の旬', '#スープ', '#一汁'],
  },
  {
    id: 'nhk_kyounoryouri_site',
    platform: 'recipe_site',
    title: 'NHK みんなのきょうの料理',
    url: 'https://www.kyounoryouri.jp/',
    active: true,
    priority: 'high',
    crawlPriority: toCrawlPriority('high'),
    patternCandidates: ['A', 'C'],
    countryContext: 'JP',
    language: 'ja',
    fixedTags: ['#今日の旬', '#ちゃんと覚えたい', '#和食', '#定番'],
  },
  {
    id: 'cococoro_youtube',
    platform: 'youtube',
    title: 'COCOCOROチャンネル',
    url: 'https://www.youtube.com/channel/UCBzHLiBZWSn7AmaW0AOAlWg',
    active: true,
    priority: 'high',
    crawlPriority: toCrawlPriority('high'),
    patternCandidates: ['C', 'E'],
    countryContext: 'JP',
    language: 'ja',
    fixedTags: ['#ちゃんと覚えたい', '#技術', '#火入れ', '#本格'],
  },

  // Pattern B
  {
    id: 'yuuka_chen_youtube',
    platform: 'youtube',
    title: '我が家の台湾料理 Yuuka Chen',
    url: 'https://www.youtube.com/c/%E6%88%91%E3%81%8C%E5%AE%B6%E3%81%AE%E5%8F%B0%E6%B9%BE%E6%96%99%E7%90%86Taiwancooking',
    active: true,
    priority: 'high',
    crawlPriority: toCrawlPriority('high'),
    patternCandidates: ['B'],
    countryContext: 'JP',
    language: 'ja',
    fixedTags: ['#知らない料理に挑戦', '#台湾料理', '#家庭料理'],
  },
  {
    id: 'yuuka_chen_instagram',
    platform: 'instagram',
    title: '我が家の台湾料理 Yuuka Chen Instagram',
    url: 'https://www.instagram.com/taiwan_cooking/',
    active: true,
    priority: 'medium',
    crawlPriority: toCrawlPriority('medium'),
    patternCandidates: ['B'],
    countryContext: 'JP',
    language: 'ja',
    fixedTags: ['#知らない料理に挑戦', '#台湾料理', '#家庭料理'],
  },
  {
    id: 'yuuka_chen_nadia',
    platform: 'recipe_site',
    title: '我が家の台湾料理 Yuuka Chen Nadia',
    url: 'https://oceans-nadia.com/user/109175',
    active: true,
    priority: 'medium',
    crawlPriority: toCrawlPriority('medium'),
    patternCandidates: ['B'],
    countryContext: 'JP',
    language: 'ja',
    fixedTags: ['#知らない料理に挑戦', '#台湾料理', '#再現'],
  },
  {
    id: 'indocurryko_youtube',
    platform: 'youtube',
    title: '印度カリー子 YouTube',
    url: 'https://www.youtube.com/channel/UCuS1lDa_TIGOlQfa6ysdapQ',
    active: true,
    priority: 'high',
    crawlPriority: toCrawlPriority('high'),
    patternCandidates: ['B', 'C'],
    countryContext: 'JP',
    language: 'ja',
    fixedTags: ['#知らない料理に挑戦', '#ちゃんと覚えたい', '#スパイス'],
  },
  {
    id: 'indocurryko_instagram',
    platform: 'instagram',
    title: '印度カリー子 Instagram',
    url: 'https://www.instagram.com/indocurryko/',
    active: true,
    priority: 'medium',
    crawlPriority: toCrawlPriority('medium'),
    patternCandidates: ['B', 'C'],
    countryContext: 'JP',
    language: 'ja',
    fixedTags: ['#知らない料理に挑戦', '#ちゃんと覚えたい', '#スパイス', '#カレー'],
  },
  {
    id: 'indocurryko_web',
    platform: 'web',
    title: '印度カリー子 公式サイト',
    url: 'https://indocurryko.net/',
    active: true,
    priority: 'low',
    crawlPriority: toCrawlPriority('low'),
    patternCandidates: ['B', 'C'],
    countryContext: 'JP',
    language: 'ja',
    fixedTags: ['#スパイス', '#ビリヤニ', '#基礎'],
  },
  {
    id: 'amazing_embassy_youtube',
    platform: 'youtube',
    title: 'Amazing Embassy Cooking YouTube',
    url: 'https://www.youtube.com/channel/UCvUUrVSUnqdwFW7d-YdvMgw',
    active: true,
    priority: 'high',
    crawlPriority: toCrawlPriority('high'),
    patternCandidates: ['B'],
    countryContext: 'JP',
    language: 'ja',
    fixedTags: ['#知らない料理に挑戦', '#世界の料理', '#大使館レシピ'],
  },
  {
    id: 'amazing_embassy_instagram',
    platform: 'instagram',
    title: 'Amazing Embassy Cooking Instagram',
    url: 'https://www.instagram.com/amazingembassycooking/',
    active: true,
    priority: 'medium',
    crawlPriority: toCrawlPriority('medium'),
    patternCandidates: ['B'],
    countryContext: 'JP',
    language: 'ja',
    fixedTags: ['#知らない料理に挑戦', '#世界の料理', '#大使館レシピ'],
  },

  // Pattern D
  {
    id: 'ryuji_buzz_youtube',
    platform: 'youtube',
    title: '料理研究家リュウジのバズレシピ',
    url: 'https://www.youtube.com/channel/UCW01sMEVYQdhcvkrhbxdBpw',
    active: true,
    priority: 'high',
    crawlPriority: toCrawlPriority('high'),
    patternCandidates: ['D'],
    countryContext: 'JP',
    language: 'ja',
    fixedTags: ['#疲れた帰りに', '#時短', '#実用', '#平日ごはん'],
  },
  {
    id: 'ryuji_buzz_instagram',
    platform: 'instagram',
    title: 'リュウジのバズレシピ Instagram',
    url: 'https://www.instagram.com/ryuji_foodlabo/',
    active: true,
    priority: 'medium',
    crawlPriority: toCrawlPriority('medium'),
    patternCandidates: ['D'],
    countryContext: 'JP',
    language: 'ja',
    fixedTags: ['#疲れた帰りに', '#時短', '#実用'],
  },
  {
    id: 'nigiricco_youtube',
    platform: 'youtube',
    title: 'にぎりっ娘。',
    url: 'https://www.youtube.com/channel/UChiZabFUXEDVSz_5NdWVhDQ',
    active: true,
    priority: 'high',
    crawlPriority: toCrawlPriority('high'),
    patternCandidates: ['D'],
    countryContext: 'JP',
    language: 'ja',
    fixedTags: ['#疲れた帰りに', '#お弁当のおかず', '#弁当', '#作り置き'],
  },
  {
    id: 'nigiricco_web',
    platform: 'web',
    title: 'にぎりっ娘。公式サイト',
    url: 'https://nigiricco.com/',
    active: true,
    priority: 'low',
    crawlPriority: toCrawlPriority('low'),
    patternCandidates: ['D'],
    countryContext: 'JP',
    language: 'ja',
    fixedTags: ['#お弁当のおかず', '#弁当', '#時短'],
  },
  {
    id: 'mami_instagram',
    platform: 'instagram',
    title: 'まみ(mami) ラクうまレシピ',
    url: 'https://www.instagram.com/mtmtharb/',
    active: true,
    priority: 'high',
    crawlPriority: toCrawlPriority('high'),
    patternCandidates: ['D'],
    countryContext: 'JP',
    language: 'ja',
    fixedTags: ['#疲れた帰りに', '#時短', '#ラクうま'],
  },
  {
    id: 'rinaty_instagram',
    platform: 'instagram',
    title: 'りなてぃ',
    url: 'https://www.instagram.com/rinaty_cooking/',
    active: true,
    priority: 'high',
    crawlPriority: toCrawlPriority('high'),
    patternCandidates: ['D'],
    countryContext: 'JP',
    language: 'ja',
    fixedTags: ['#疲れた帰りに', '#節約', '#献立', '#買い出し'],
  },

  // Pattern E
  {
    id: 'haru_an_youtube',
    platform: 'youtube',
    title: 'はるあん',
    url: 'https://www.youtube.com/channel/UCiMq2YMvF47o7K4FIZxkjFw',
    active: true,
    priority: 'high',
    crawlPriority: toCrawlPriority('high'),
    patternCandidates: ['E', 'A'],
    countryContext: 'JP',
    language: 'ja',
    fixedTags: ['#誰かに作る', '#週末のゆっくり朝ごはん', '#おやつ', '#パン'],
  },
  {
    id: 'haru_an_instagram',
    platform: 'instagram',
    title: 'はるあん Instagram',
    url: 'https://www.instagram.com/haru_fuumi/',
    active: true,
    priority: 'medium',
    crawlPriority: toCrawlPriority('medium'),
    patternCandidates: ['E', 'A'],
    countryContext: 'JP',
    language: 'ja',
    fixedTags: ['#誰かに作る', '#週末のゆっくり朝ごはん', '#おやつ'],
  },
];

