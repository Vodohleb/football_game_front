import type { Rarity } from '@/types/api';

export interface RarityStyle {
  label: string;
  text: string;
  border: string;
  gradient: string;
  glow: string;
  chip: string;
}

export const RARITY_STYLES: Record<Rarity, RarityStyle> = {
  common: {
    label: 'Common',
    text: 'text-slate-200',
    border: 'border-slate-500/60',
    gradient: 'from-slate-700 via-slate-800 to-slate-900',
    glow: 'shadow-slate-900/40',
    chip: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  },
  rare: {
    label: 'Rare',
    text: 'text-blue-200',
    border: 'border-blue-500/60',
    gradient: 'from-blue-700 via-blue-900 to-slate-900',
    glow: 'shadow-blue-900/40',
    chip: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  },
  special: {
    label: 'Special',
    text: 'text-purple-200',
    border: 'border-purple-500/60',
    gradient: 'from-purple-700 via-purple-900 to-slate-900',
    glow: 'shadow-purple-900/40',
    chip: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  },
  world_class: {
    label: 'World Class',
    text: 'text-amber-200',
    border: 'border-gold/70',
    gradient: 'from-amber-600 via-yellow-800 to-stone-900',
    glow: 'shadow-amber-900/40',
    chip: 'bg-amber-500/15 text-gold border-amber-500/30',
  },
  icon: {
    label: 'Icon',
    text: 'text-emerald-100',
    border: 'border-emerald-300/70',
    gradient: 'from-emerald-500 via-teal-800 to-slate-900',
    glow: 'shadow-emerald-900/50',
    chip: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30',
  },
  legend: {
    label: 'Legend',
    text: 'text-rose-100',
    border: 'border-rose-300/70',
    gradient: 'from-rose-500 via-fuchsia-900 to-slate-900',
    glow: 'shadow-rose-900/50',
    chip: 'bg-rose-500/15 text-rose-200 border-rose-400/30',
  },
};

export const RARITY_ORDER: Rarity[] = [
  'common',
  'rare',
  'special',
  'world_class',
  'icon',
  'legend',
];

export function rarityStyle(rarity: string): RarityStyle {
  return RARITY_STYLES[(rarity as Rarity) ?? 'common'] ?? RARITY_STYLES.common;
}
