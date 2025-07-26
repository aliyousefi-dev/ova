import { Routes, UrlSegment, UrlMatchResult } from '@angular/router';
import { NavBarComponent } from './components/common/navbar/navbar.component';
import { LibraryPage } from './pages/library/library.page';
import { WatchPage } from './pages/watch/watch.page';
import { NotFoundPage } from './pages/NotFoundComponent/not-found.page';
import { HomePage } from './pages/home/home.page';
import { LoginPage } from './pages/login/login.page';
import { AuthGuard } from './services/auth.guard';
import { SavedPage } from './pages/saved/saved.page';
import { PlaylistsPage } from './pages/playlists/playlists.page';
import { PlaylistDetailPage } from './pages/playlists-detail/playlist-detail.page';
import { DiscoverPage } from './pages/discover/discover.page';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { ProfilePage } from './pages/profile/profile.page';
import { HistoryPage } from './pages/history/history.page';
import { LatestPage } from './pages/latest/latest.page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
    canActivate: [AuthGuard],
  },
  {
    path: 'latest',
    component: LatestPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'history',
    component: HistoryPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'library',
    component: LibraryPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'watch/:videoId',
    component: WatchPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard',
    component: DashboardPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    component: ProfilePage,
    canActivate: [AuthGuard],
  },
  {
    path: 'saved',
    component: SavedPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'discover',
    component: DiscoverPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'playlists',
    component: PlaylistsPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'playlists/:title',
    component: PlaylistDetailPage,
    canActivate: [AuthGuard],
  },

  // Public routes outside the layout shell
  {
    path: 'login',
    component: LoginPage,
  },
  {
    path: '**',
    component: NotFoundPage,
  },
];
