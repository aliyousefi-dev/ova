import { Routes } from '@angular/router';
import { VideoComponent } from './pages/video/video.component';
import { WatchComponent } from './pages/watch/watch.component';
import { NotFoundComponent } from './pages/NotFoundComponent/NotFoundComponent';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'videos',
    component: VideoComponent,
  },
  {
    path: 'watch/:videoId',
    component: WatchComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
