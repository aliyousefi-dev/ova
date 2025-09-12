import { Routes } from '@angular/router';

import { NotFoundPage } from './pages/404/404.page';

import { LoginPage } from './pages/login/login.page';
import { AuthGuard } from './services/auth.guard';

import { DocsRoutes } from './routes/docs.routes';
import { MainDocPage } from './docs/main-doc/main-doc.page';

import { MainRoutes } from './routes/main.routes';
import { MainApp } from './main-app/main-app';

export const routes: Routes = [
  {
    path: '',
    component: MainApp,
    children: [...MainRoutes],
    canActivate: [AuthGuard],
  },
  {
    path: 'docs',
    component: MainDocPage,
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
