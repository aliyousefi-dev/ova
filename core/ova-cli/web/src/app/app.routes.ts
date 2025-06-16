import { Routes, UrlSegment, UrlMatchResult } from '@angular/router';
import { LibraryPage } from './pages/library/library.page';
import { WatchPage } from './pages/watch/watch.page';
import { NotFoundPage } from './pages/NotFoundComponent/not-found.page';
import { HomePage } from './pages/home/home.page';
import { LoginPage } from './pages/login/login.page';
import { AuthGuard } from './services/auth.guard';
import { FavoritesPage } from './pages/favorites/favorites.page';
import { PlaylistsPage } from './pages/playlists/playlists.page';
import { PlaylistDetailPage } from './pages/playlists-detail/playlist-detail.page';
import { DiscoverPage } from './pages/discover/discover.page';
import { DashboardPage } from './pages/dashboard/dashboard.page';

// Custom matcher to catch /library + optional nested folder path
export function libraryFolderMatcher(
  segments: UrlSegment[]
): UrlMatchResult | null {
  if (segments.length === 0) {
    return null;
  }
  if (segments[0].path !== 'library') {
    return null;
  }

  // Join everything after 'library' as a single param
  const folderPath =
    segments.length > 1
      ? segments
          .slice(1)
          .map((s) => s.path)
          .join('/')
      : '';
  return {
    consumed: segments,
    posParams: {
      folderPath: new UrlSegment(folderPath, {}),
    },
  };
}

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
    canActivate: [AuthGuard], // protected
  },
  {
    matcher: libraryFolderMatcher,
    component: LibraryPage,
    canActivate: [AuthGuard], // protected
  },
  {
    path: 'watch/:videoId',
    component: WatchPage,
    canActivate: [AuthGuard], // protected
  },
  {
    path: 'dashboard',
    component: DashboardPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'favorites',
    component: FavoritesPage,
    canActivate: [AuthGuard], // protected
  },
  {
    path: 'discover',
    component: DiscoverPage,
    canActivate: [AuthGuard], // protected
  },
  {
    path: 'playlists',
    component: PlaylistsPage,
    canActivate: [AuthGuard], // protected
  },
  {
    path: 'playlists/:title',
    component: PlaylistDetailPage,
  },
  {
    path: 'login',
    component: LoginPage,
  },
  {
    path: '**',
    component: NotFoundPage,
  },
];
