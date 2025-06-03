import { Routes } from '@angular/router';
import { VideoComponent } from './pages/video/video.component';
import { WatchComponent } from './pages/watch/watch.component';
import { NotFoundComponent } from './pages/NotFoundComponent/NotFoundComponent';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard], // ⬅️ protected
  },
  {
    path: 'videos',
    component: VideoComponent,
    canActivate: [AuthGuard], // ⬅️ protected
  },
  {
    path: 'watch/:videoId',
    component: WatchComponent,
    canActivate: [AuthGuard], // ⬅️ protected
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
