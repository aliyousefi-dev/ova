import { Routes } from '@angular/router';
import { VideoComponent } from './pages/video/video.component';
import { WatchComponent } from './pages/watch/watch.component';
import { NotFoundComponent } from './pages/NotFoundComponent/not-found.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './services/auth.guard';
import { FavoritesComponent } from './pages/favorites/favorites.component';
import { PlaylistsComponent } from './pages/playlists/playlists.component';
import { PlaylistDetailComponent } from './pages/playlists-detail/playlist-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard], // ⬅️ protected
  },
  {
    path: 'libraty',
    component: VideoComponent,
    canActivate: [AuthGuard], // ⬅️ protected
  },
  {
    path: 'watch/:videoId',
    component: WatchComponent,
    canActivate: [AuthGuard], // ⬅️ protected
  },
  {
    path: 'favorites',
    component: FavoritesComponent,
    canActivate: [AuthGuard], // ⬅️ protected
  },
  {
    path: 'playlists',
    component: PlaylistsComponent,
    canActivate: [AuthGuard], // ⬅️ protected
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
