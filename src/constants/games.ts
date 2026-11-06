export type GameCategory = 'all' | 'knowledge' | 'reaction' | 'squad';

export interface GameMeta {
  code: string;
  title: string;
  short: string;
  description: string;
  category: Exclude<GameCategory, 'all'>;
  accent: string;
  route: string;
  modes: { value: string; label: string }[];
  defaultMode: string;
}

export const GAME_META: Record<string, GameMeta> = {
  draft: {
    code: 'draft',
    title: 'Draft Challenge',
    short: 'Draft',
    description:
      'Соберите состав из предложенных карточек: позиция за позицией, выбор за выбором.',
    category: 'squad',
    accent: 'from-emerald-500/30 to-teal-900/10',
    route: '/app/games/draft',
    modes: [
      { value: 'classic', label: 'Classic' },
      { value: 'daily', label: 'Daily' },
    ],
    defaultMode: 'classic',
  },
  guess_player: {
    code: 'guess_player',
    title: 'Guess the Player',
    short: 'Guess',
    description:
      'Угадайте футболиста по подсказкам. Чем меньше подсказок — тем больше очков.',
    category: 'knowledge',
    accent: 'from-blue-500/30 to-indigo-900/10',
    route: '/app/games/guess-player',
    modes: [
      { value: 'classic', label: 'Classic' },
      { value: 'daily', label: 'Daily' },
    ],
    defaultMode: 'classic',
  },
  penalty: {
    code: 'penalty',
    title: 'Penalty Shootout',
    short: 'Penalty',
    description:
      'Пять ударов, девять секторов и вратарь, который читает ваши мысли.',
    category: 'reaction',
    accent: 'from-rose-500/30 to-red-900/10',
    route: '/app/games/penalty',
    modes: [
      { value: 'normal', label: 'Normal' },
      { value: 'hard', label: 'Hard' },
    ],
    defaultMode: 'normal',
  },
  tiki_taka_toe: {
    code: 'tiki_taka_toe',
    title: 'Tiki-Taka-Toe',
    short: 'Tiki-Taka',
    description:
      'Заполните сетку 3×3 футболистами, подходящими под пересечение условий.',
    category: 'knowledge',
    accent: 'from-purple-500/30 to-fuchsia-900/10',
    route: '/app/games/tiki-taka',
    modes: [
      { value: 'classic', label: 'Classic' },
      { value: 'daily', label: 'Daily' },
    ],
    defaultMode: 'classic',
  },
  higher_lower: {
    code: 'higher_lower',
    title: 'Higher or Lower',
    short: 'Higher/Lower',
    description:
      'Сравните двух футболистов по выбранной характеристике. Ошибка может стоить серии.',
    category: 'knowledge',
    accent: 'from-amber-500/30 to-orange-900/10',
    route: '/app/games/higher-lower',
    modes: [
      { value: 'classic', label: 'Classic' },
      { value: 'endless', label: 'Endless' },
      { value: 'daily', label: 'Daily' },
    ],
    defaultMode: 'classic',
  },
  mystery_player: {
    code: 'mystery_player',
    title: 'Mystery Player',
    short: 'Mystery',
    description:
      'Раскрывайте подсказки одну за другой и назовите загадочного футболиста.',
    category: 'knowledge',
    accent: 'from-cyan-500/30 to-sky-900/10',
    route: '/app/games/mystery-player',
    modes: [
      { value: 'classic', label: 'Classic' },
      { value: 'daily', label: 'Daily' },
    ],
    defaultMode: 'classic',
  },
};

export const GAME_ORDER = [
  'draft',
  'guess_player',
  'penalty',
  'tiki_taka_toe',
  'higher_lower',
  'mystery_player',
];

export const GAME_CATEGORIES: { value: GameCategory; label: string }[] = [
  { value: 'all', label: 'Все игры' },
  { value: 'knowledge', label: 'На знания' },
  { value: 'reaction', label: 'На реакцию' },
  { value: 'squad', label: 'Составление команд' },
];

export const STAT_LABELS: Record<string, string> = {
  overall_rating: 'Overall',
  pace: 'Pace',
  shooting: 'Shooting',
  passing: 'Passing',
  dribbling: 'Dribbling',
  defending: 'Defending',
  physical: 'Physical',
};

export const PVP_GAMES = [
  { value: 'pvp_penalty', label: 'Penalty PvP' },
  { value: 'pvp_quiz', label: 'Football Quiz PvP' },
];
