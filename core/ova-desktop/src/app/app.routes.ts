import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page';
import { InitPage } from './pages/init-page/init-page';
import { LoginPage } from './pages/login-page/login-page';
import { RepositoryHomePage } from './pages/repository-home-page/repository-home-page';
import { ServerSetupPage } from './pages/server-setup.page/server-setup.page';

export const routes: Routes = [
  { path: 'home', component: HomePageComponent }, // Default route (Home)
  { path: 'init', component: InitPage }, // Init route
  { path: 'login', component: LoginPage }, // Login route
  { path: '', component: RepositoryHomePage }, // Server Connection route
  { path: 'setup-server', component: ServerSetupPage }, // Server Setup route
];
