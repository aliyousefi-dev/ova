import { Routes, UrlSegment, UrlMatchResult } from '@angular/router';
import { VideoComponent } from './pages/video/video.component';
import { WatchComponent } from './pages/watch/watch.component';
import { NotFoundComponent } from './pages/NotFoundComponent/not-found.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './services/auth.guard';
import { FavoritesComponent } from './pages/favorites/favorites.component';
import { PlaylistsComponent } from './pages/playlists/playlists.component';
import { PlaylistDetailComponent } from './pages/playlists-detail/playlist-detail.component';
import { DiscoverComponent } from './pages/discover/discover.component';
import { SettingsComponent } from './pages/settings/settings.component';

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
    component: HomeComponent,
    canActivate: [AuthGuard], // protected
  },
  {
    matcher: libraryFolderMatcher,
    component: VideoComponent,
    canActivate: [AuthGuard], // protected
  },
  {
    path: 'watch/:videoId',
    component: WatchComponent,
    canActivate: [AuthGuard], // protected
  },
  {
    path: 'favorites',
    component: FavoritesComponent,
    canActivate: [AuthGuard], // protected
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard], // protected
  },
  {
    path: 'discover',
    component: DiscoverComponent,
    canActivate: [AuthGuard], // protected
  },
  {
    path: 'playlists',
    component: PlaylistsComponent,
    canActivate: [AuthGuard], // protected
  },
  {
    path: 'playlists/:title',
    component: PlaylistDetailComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
