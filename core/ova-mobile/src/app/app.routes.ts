import { Routes } from '@angular/router';
import { SetupServer } from './pages/setup-server/setup-server';
import { WelcomePage } from './pages/welcome-page/welcome-page';
import { DiscoverPage } from './pages/discover-page/discover-page';
import { LibraryPage } from './pages/library-page/library-page';
import { SavedPage } from './pages/saved-page/saved-page';
import { PlaylistPage } from './pages/playlist-page/playlist-page';

export const routes: Routes = [
  { path: '', component: WelcomePage },
  { path: 'setup-server', component: SetupServer },
  { path: 'discover', component: DiscoverPage },
  { path: 'library', component: LibraryPage },
  { path: 'saved', component: SavedPage },
  { path: 'playlist', component: PlaylistPage },
];
