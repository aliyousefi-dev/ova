import { Routes, UrlSegment, UrlMatchResult } from '@angular/router';
import { WelcomePage } from './pages/welcome-page/welcome-page';
import { DiscoverPage } from './pages/discover-page/discover-page';
import { LibraryPage } from './pages/library-page/library-page';
import { SavedPage } from './pages/saved-page/saved-page';
import { PlaylistsPage } from './pages/playlists-page/playlists-page';
import { NotExistsPage } from './pages/not-exists-page/not-exists-page';
import { WatchPage } from './pages/watch-page/watch-page';
import { LoginPage } from './pages/login-page/login-page';
import { AuthGuard } from './services/auth.guard';

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
  { path: '', component: SavedPage, canActivate: [AuthGuard] },
  { path: 'discover', component: DiscoverPage, canActivate: [AuthGuard] },
  {
    matcher: libraryFolderMatcher,
    component: LibraryPage,
    canActivate: [AuthGuard],
  },
  { path: 'saved', component: SavedPage, canActivate: [AuthGuard] },
  { path: 'playlists', component: PlaylistsPage, canActivate: [AuthGuard] },

  {
    path: 'watch/:videoId',
    component: WatchPage,
    canActivate: [AuthGuard],
  },

  { path: 'login', component: LoginPage },
  { path: '**', component: NotExistsPage },
];
