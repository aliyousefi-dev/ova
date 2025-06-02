import { Routes } from '@angular/router';
import { VideoComponent } from './video/video.component';
import { WatchComponent } from './watch/watch.component';
import { NotFoundComponent } from './NotFoundComponent/NotFoundComponent';
import { HomeComponent } from './home/home.component';

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
