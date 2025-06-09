import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'playlist',
        loadComponent: () =>
          import('../pages/playlists/playlists.page').then(
            (m) => m.PlaylistsPage
          ),
      },
      {
        path: 'library',
        loadComponent: () =>
          import('../pages/library/library.page').then((m) => m.LibraryPage),
      },
      {
        path: 'home',
        loadComponent: () =>
          import('../pages/home/home.page').then((m) => m.HomePage),
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full',
  },
];
