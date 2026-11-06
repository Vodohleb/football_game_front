import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  Coins,
  Gamepad2,
  Shield,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { GameIcon } from '@/components/games/GameIcon';
import { Logo } from '@/components/layout/Logo';
import { PlayerCard } from '@/components/cards/PlayerCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { GAME_META, GAME_ORDER } from '@/constants/games';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAuthStore } from '@/stores/authStore';
import type { CardSnapshot } from '@/types/api';

const SAMPLE_CARD: CardSnapshot = {
  card_id: 'sample',
  card_name: 'Arena Legend',
  player_id: 'sample-player',
  player_name: 'A. Striker',
  player_full_name: 'Arena Striker',
  nationality: 'Brazil',
  position: 'ST',
  club: 'Football Arena',
  league: 'Arena League',
  rarity: 'world_class',
  overall_rating: 94,
  stats: {
    pace: 95,
    shooting: 94,
    passing: 88,
    dribbling: 93,
    defending: 45,
    physical: 86,
    overall_rating: 94,
  },
};

const FEATURES = [
  {
    icon: Gamepad2,
    title: 'Шесть мини-игр',
    text: 'Draft, Guess the Player, Penalty, Tiki-Taka-Toe, Higher or Lower и Mystery Player.',
  },
  {
    icon: Shield,
    title: 'Коллекция и клуб',
    text: 'Открывайте паки, собирайте карточки и создавайте состав мечты по игровым схемам.',
  },
  {
    icon: Swords,
    title: 'PvP-дуэли',
    text: 'Быстрый матч или игра с другом по коду комнаты: пенальти и футбольная викторина.',
  },
  {
    icon: Trophy,
    title: 'Рейтинг и задания',
    text: 'ELO-рейтинг, таблицы лидеров, ежедневные квесты и достижения с наградами.',
  },
];

export default function HomePage() {
  useDocumentTitle('Футбольная игровая платформа');
  const token = useAuthStore((state) => state.accessToken);
  const primaryTo = token ? '/app/dashboard' : '/register';

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-30" />
      <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-accent-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full bg-blue/10 blur-3xl" />

      <header className="relative z-10 mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm text-text-secondary md:flex">
          <a href="#features" className="transition-colors hover:text-text-primary">
            Возможности
          </a>
          <a href="#games" className="transition-colors hover:text-text-primary">
            Игры
          </a>
          <a href="#about" className="transition-colors hover:text-text-primary">
            О платформе
          </a>
        </nav>
        <div className="flex items-center gap-2">
          {token ? (
            <Link to="/app/dashboard">
              <Button size="sm">В игру</Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button size="sm" variant="ghost">
                  Войти
                </Button>
              </Link>
              <Link to="/register" className="hidden sm:block">
                <Button size="sm">Начать</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-24 lg:pt-16">
          <div>
            <Badge variant="success" dot>
              MVP v1.0 · Football Gaming Platform
            </Badge>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] text-text-primary sm:text-5xl lg:text-6xl">
              Футбол, карточки
              <span className="text-gradient"> и азарт</span> в одной арене
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
              Играйте в шесть футбольных мини-игр, открывайте паки, собирайте
              коллекцию карточек, создавайте клуб и сражайтесь с другими
              игроками в PvP.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to={primaryTo}>
                <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  {token ? 'Продолжить игру' : 'Создать аккаунт'}
                </Button>
              </Link>
              <Link to={token ? '/app/games' : '/login'}>
                <Button size="lg" variant="secondary" leftIcon={<Gamepad2 className="h-4 w-4" />}>
                  {token ? 'К мини-играм' : 'Уже есть аккаунт'}
                </Button>
              </Link>
            </div>
            <div className="mt-9 grid max-w-lg grid-cols-3 gap-3">
              {[
                { icon: Gamepad2, value: '6', label: 'мини-игр' },
                { icon: Users, value: 'PvP', label: 'дуэли 1×1' },
                { icon: Coins, value: '1000', label: 'стартовых монет' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-border bg-bg-card/60 px-3 py-3 backdrop-blur"
                >
                  <item.icon className="mb-2 h-4 w-4 text-accent-primary" />
                  <p className="font-display text-xl font-extrabold text-text-primary">
                    {item.value}
                  </p>
                  <p className="text-[11px] text-text-muted">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-8 rounded-full bg-accent-primary/15 blur-3xl" />
            <motion.div
              initial={{ opacity: 0, y: 24, rotate: -4 }}
              animate={{ opacity: 1, y: 0, rotate: -6 }}
              transition={{ duration: 0.7 }}
              className="absolute left-0 top-12 w-48 opacity-70 sm:w-56"
            >
              <PlayerCard
                card={{
                  ...SAMPLE_CARD,
                  card_id: 'sample-2',
                  player_name: 'M. Maestro',
                  player_full_name: 'Mister Maestro',
                  position: 'CAM',
                  rarity: 'special',
                  overall_rating: 88,
                  stats: {
                    pace: 82,
                    shooting: 86,
                    passing: 94,
                    dribbling: 92,
                    defending: 62,
                    physical: 70,
                    overall_rating: 88,
                  },
                }}
                size="sm"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24, rotate: 4 }}
              animate={{ opacity: 1, y: 0, rotate: 5 }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="relative z-10 ml-auto w-56 animate-float sm:w-64"
            >
              <PlayerCard card={SAMPLE_CARD} size="lg" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 }}
              className="absolute -bottom-4 left-6 z-20 flex items-center gap-2 rounded-2xl border border-border bg-bg-card px-4 py-3 shadow-2xl"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15 text-gold">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-text-muted">
                  Pack opening
                </p>
                <p className="text-sm font-bold text-text-primary">
                  World Class выпал!
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="features" className="border-y border-border bg-bg-secondary/50 py-16">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-primary">
                Возможности
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-text-primary">
                Всё для футбольного прогресса
              </h2>
              <p className="mt-3 text-sm text-text-secondary">
                Платформа объединяет игровые режимы, карточную коллекцию,
                экономику и соревновательную систему с честным серверным
                расчётом результатов.
              </p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className="rounded-2xl border border-border bg-bg-card p-5"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent-primary/20 bg-accent-primary/10 text-accent-primary">
                    <feature.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-text-primary">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                    {feature.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="games" className="py-16">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-primary">
                  Игровые режимы
                </p>
                <h2 className="mt-2 text-3xl font-extrabold text-text-primary">
                  Шесть способов проверить себя
                </h2>
              </div>
              <Link to={primaryTo}>
                <Button variant="secondary" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Открыть игры
                </Button>
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {GAME_ORDER.map((code, index) => {
                const meta = GAME_META[code];
                return (
                  <motion.div
                    key={code}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <Link
                      to={token ? meta.route : '/register'}
                      className={`group flex h-full flex-col rounded-2xl border border-border bg-gradient-to-br ${meta.accent} p-5 transition-transform hover:-translate-y-1`}
                    >
                      <div className="flex items-center justify-between">
                        <GameIcon code={code} size="md" />
                        <Target className="h-4 w-4 text-text-muted transition-colors group-hover:text-accent-primary" />
                      </div>
                      <h3 className="mt-4 font-display text-lg font-bold text-text-primary">
                        {meta.title}
                      </h3>
                      <p className="mt-1.5 flex-1 text-sm text-text-secondary">
                        {meta.description}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary">
                        Играть
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="about" className="pb-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-bg-card via-bg-secondary to-bg-card px-6 py-10 sm:px-10">
              <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-accent-primary/10 blur-3xl" />
              <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2 text-accent-primary">
                    <Award className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-[0.18em]">
                      Начни прямо сейчас
                    </span>
                  </div>
                  <h2 className="mt-3 text-2xl font-extrabold text-text-primary sm:text-3xl">
                    Стартовый баланс, карточки и рейтинг уже ждут
                  </h2>
                  <p className="mt-2 text-sm text-text-secondary">
                    Создайте аккаунт, получите стартовые награды и откройте
                    первый пак. Все игровые результаты рассчитываются на сервере.
                  </p>
                </div>
                <Link to={primaryTo}>
                  <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    {token ? 'В личный кабинет' : 'Зарегистрироваться'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border py-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <Logo />
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Football Arena. MVP v1.0
          </p>
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span>Правила</span>
            <span>Конфиденциальность</span>
            <span>Поддержка</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
