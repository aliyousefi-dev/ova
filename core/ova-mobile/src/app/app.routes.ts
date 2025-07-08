import { Routes } from '@angular/router';
import { SetupServer } from './pages/setup-server/setup-server';
import { WelcomePage } from './pages/welcome-page/welcome-page';

export const routes: Routes = [
  { path: '', component: WelcomePage },
  { path: 'setup-server', component: SetupServer },
];
