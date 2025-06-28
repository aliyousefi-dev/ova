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
    component: NavBarComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: HomePage,
      },
      {
        path: 'history',
        component: HistoryPage,
      },
      {
        matcher: libraryFolderMatcher,
        component: LibraryPage,
      },
      {
        path: 'watch/:videoId',
        component: WatchPage,
      },
      {
        path: 'dashboard',
        component: DashboardPage,
      },
      {
        path: 'profile',
        component: ProfilePage,
      },
      {
        path: 'saved',
        component: SavedPage,
      },
      {
        path: 'discover',
        component: DiscoverPage,
      },
      {
        path: 'playlists',
        component: PlaylistsPage,
      },
      {
        path: 'playlists/:title',
        component: PlaylistDetailPage,
      },
    ],
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
