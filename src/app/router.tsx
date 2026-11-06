import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AppLayout } from '@/components/layout/AppLayout';
import { PublicOnly, RequireAdmin, RequireAuth } from '@/components/layout/RouteGuards';

const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const GamesPage = lazy(() => import('@/pages/GamesPage'));
const DraftPage = lazy(() => import('@/pages/DraftPage'));
const GuessPlayerPage = lazy(() => import('@/pages/GuessPlayerPage'));
const MysteryPlayerPage = lazy(() => import('@/pages/MysteryPlayerPage'));
const PenaltyPage = lazy(() => import('@/pages/PenaltyPage'));
const TikiTakaPage = lazy(() => import('@/pages/TikiTakaPage'));
const HigherLowerPage = lazy(() => import('@/pages/HigherLowerPage'));

const CompetitionsPage = lazy(() => import('@/pages/CompetitionsPage'));
const QuickMatchPage = lazy(() => import('@/pages/QuickMatchPage'));
const RoomsPage = lazy(() => import('@/pages/RoomsPage'));
const RoomPage = lazy(() => import('@/pages/RoomPage'));
const MatchPage = lazy(() => import('@/pages/MatchPage'));

const CollectionPage = lazy(() => import('@/pages/CollectionPage'));
const SquadPage = lazy(() => import('@/pages/SquadPage'));
const CardDetailPage = lazy(() => import('@/pages/CardDetailPage'));

const ShopPage = lazy(() => import('@/pages/ShopPage'));
const PackOpeningPage = lazy(() => import('@/pages/PackOpeningPage'));

const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage'));
const QuestsPage = lazy(() => import('@/pages/QuestsPage'));
const AchievementsPage = lazy(() => import('@/pages/AchievementsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));

const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminPlayersPage = lazy(() => import('@/pages/admin/AdminPlayersPage'));
const AdminCardsPage = lazy(() => import('@/pages/admin/AdminCardsPage'));
const AdminPacksPage = lazy(() => import('@/pages/admin/AdminPacksPage'));
const AdminGamesPage = lazy(() => import('@/pages/admin/AdminGamesPage'));
const AdminQuestionsPage = lazy(() => import('@/pages/admin/AdminQuestionsPage'));
const AdminEconomyPage = lazy(() => import('@/pages/admin/AdminEconomyPage'));
const AdminRatingsPage = lazy(() => import('@/pages/admin/AdminRatingsPage'));
const AdminMatchesPage = lazy(() => import('@/pages/admin/AdminMatchesPage'));
const AdminLogsPage = lazy(() => import('@/pages/admin/AdminLogsPage'));

function withSuspense(element: ReactNode): ReactNode {
  return (
    <Suspense fallback={<LoadingScreen fullscreen label="Загрузка..." />}>
      {element}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  { path: '/', element: withSuspense(<HomePage />) },
  {
    path: '/login',
    element: withSuspense(
      <PublicOnly>
        <LoginPage />
      </PublicOnly>,
    ),
  },
  {
    path: '/register',
    element: withSuspense(
      <PublicOnly>
        <RegisterPage />
      </PublicOnly>,
    ),
  },
  {
    path: '/forgot-password',
    element: withSuspense(
      <PublicOnly>
        <ForgotPasswordPage />
      </PublicOnly>,
    ),
  },
  {
    path: '/app',
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: withSuspense(<DashboardPage />) },
          { path: 'games', element: withSuspense(<GamesPage />) },
          { path: 'games/draft', element: withSuspense(<DraftPage />) },
          { path: 'games/guess-player', element: withSuspense(<GuessPlayerPage />) },
          { path: 'games/mystery-player', element: withSuspense(<MysteryPlayerPage />) },
          { path: 'games/penalty', element: withSuspense(<PenaltyPage />) },
          { path: 'games/tiki-taka', element: withSuspense(<TikiTakaPage />) },
          { path: 'games/higher-lower', element: withSuspense(<HigherLowerPage />) },
          { path: 'competitions', element: withSuspense(<CompetitionsPage />) },
          { path: 'competitions/quick-match', element: withSuspense(<QuickMatchPage />) },
          { path: 'competitions/rooms', element: withSuspense(<RoomsPage />) },
          { path: 'competitions/rooms/:roomId', element: withSuspense(<RoomPage />) },
          { path: 'competitions/match/:matchId', element: withSuspense(<MatchPage />) },
          { path: 'club', element: <Navigate to="collection" replace /> },
          { path: 'club/collection', element: withSuspense(<CollectionPage />) },
          { path: 'club/squad', element: withSuspense(<SquadPage />) },
          { path: 'club/cards/:cardId', element: withSuspense(<CardDetailPage />) },
          { path: 'shop', element: <Navigate to="packs" replace /> },
          { path: 'shop/packs', element: withSuspense(<ShopPage />) },
          { path: 'shop/opening/:packId', element: withSuspense(<PackOpeningPage />) },
          { path: 'leaderboard', element: withSuspense(<LeaderboardPage />) },
          { path: 'quests', element: withSuspense(<QuestsPage />) },
          { path: 'achievements', element: withSuspense(<AchievementsPage />) },
          { path: 'profile', element: withSuspense(<ProfilePage />) },
        ],
      },
    ],
  },
  {
    path: '/admin',
    element: <RequireAdmin />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: withSuspense(<AdminDashboardPage />) },
          { path: 'users', element: withSuspense(<AdminUsersPage />) },
          { path: 'players', element: withSuspense(<AdminPlayersPage />) },
          { path: 'cards', element: withSuspense(<AdminCardsPage />) },
          { path: 'packs', element: withSuspense(<AdminPacksPage />) },
          { path: 'games', element: withSuspense(<AdminGamesPage />) },
          { path: 'questions', element: withSuspense(<AdminQuestionsPage />) },
          { path: 'economy', element: withSuspense(<AdminEconomyPage />) },
          { path: 'ratings', element: withSuspense(<AdminRatingsPage />) },
          { path: 'matches', element: withSuspense(<AdminMatchesPage />) },
          { path: 'logs', element: withSuspense(<AdminLogsPage />) },
        ],
      },
    ],
  },
  { path: '*', element: withSuspense(<NotFoundPage />) },
]);
