import { Routes } from '@angular/router';

import { NotFoundPage } from './pages/404/404.page';

import { LoginPage } from './pages/login/login.page';
import { AuthGuard } from './services/auth.guard';

import { DocsRoutes } from './docs.routes';
import { MainRoutes } from './main.routes';

export const routes: Routes = [
  {
    path: '',
    children: [...MainRoutes],
    canActivate: [AuthGuard],
  },
  {
    path: 'docs',
    children: [...DocsRoutes],
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
