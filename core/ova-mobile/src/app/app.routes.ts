import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'setup',
    pathMatch: 'full',
  },
  {
    path: 'setup',
    loadComponent: () =>
      import('./pages/setup/setup.page').then((m) => m.SetupPage),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'playlists',
    loadComponent: () =>
      import('./pages/playlists/playlists.page').then((m) => m.PlaylistsPage),
  },
  {
    path: 'library',
    loadComponent: () =>
      import('./pages/library/library.page').then((m) => m.LibraryPage),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.page').then((m) => m.SettingsPage),
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'watch/:videoId',
    loadComponent: () =>
      import('./pages/watch/watch.page').then((m) => m.WatchPage),
  },
];
