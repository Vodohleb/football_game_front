import {
  Award,
  ClipboardList,
  Gamepad2,
  LayoutDashboard,
  Shield,
  ShoppingBag,
  Swords,
  Trophy,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const APP_NAV: NavSection[] = [
  {
    title: 'Играть',
    items: [
      { to: '/app/dashboard', label: 'Главная', icon: LayoutDashboard },
      { to: '/app/games', label: 'Мини-игры', icon: Gamepad2 },
      { to: '/app/competitions', label: 'Соревнования', icon: Swords },
      {
        to: '/app/club/collection',
        label: 'Мой клуб',
        icon: Shield,
      },
      { to: '/app/shop/packs', label: 'Магазин', icon: ShoppingBag },
    ],
  },
  {
    title: 'Прогресс',
    items: [
      { to: '/app/leaderboard', label: 'Рейтинг', icon: Trophy },
      { to: '/app/quests', label: 'Задания', icon: ClipboardList },
      { to: '/app/achievements', label: 'Достижения', icon: Award },
    ],
  },
  {
    title: 'Аккаунт',
    items: [{ to: '/app/profile', label: 'Профиль', icon: UserRound }],
  },
];

export const MOBILE_NAV: NavItem[] = [
  { to: '/app/dashboard', label: 'Главная', icon: LayoutDashboard },
  { to: '/app/games', label: 'Игры', icon: Gamepad2 },
  { to: '/app/competitions', label: 'PvP', icon: Swords },
  { to: '/app/club/collection', label: 'Клуб', icon: Shield },
  { to: '/app/profile', label: 'Профиль', icon: UserRound },
];

export const ADMIN_NAV: NavSection[] = [
  {
    title: 'Обзор',
    items: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Контент',
    items: [
      { to: '/admin/users', label: 'Пользователи', icon: Shield },
      { to: '/admin/players', label: 'Футболисты', icon: UserRound },
      { to: '/admin/cards', label: 'Карточки', icon: Award },
      { to: '/admin/packs', label: 'Паки', icon: ShoppingBag },
      { to: '/admin/games', label: 'Игры', icon: Gamepad2 },
      { to: '/admin/questions', label: 'Вопросы', icon: ClipboardList },
    ],
  },
  {
    title: 'Система',
    items: [
      { to: '/admin/economy', label: 'Экономика', icon: Trophy },
      { to: '/admin/ratings', label: 'Рейтинги', icon: Swords },
      { to: '/admin/matches', label: 'Матчи', icon: Swords },
      { to: '/admin/logs', label: 'Логи', icon: ClipboardList },
    ],
  },
];
