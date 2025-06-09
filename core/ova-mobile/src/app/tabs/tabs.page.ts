import { Component, EnvironmentInjector, inject } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  triangle,
  ellipse,
  square,
  homeSharp,
  library,
  moon,
} from 'ionicons/icons';
import { Router } from '@angular/router'; // <-- Add this import
import { VideoPlayerService } from '../services/video-player.service';
import { MiniPlayerComponent } from '../components/mini-player/mini-player.component';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonTitle,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    MiniPlayerComponent, // <-- Add this import
  ],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);

  constructor(
    private router: Router,
    public videoPlayer: VideoPlayerService // <-- Inject and make public
  ) {
    addIcons({ triangle, ellipse, square, homeSharp, library, moon }); // <-- Add moon
  }

  goToSetup() {
    this.router.navigateByUrl('/setup', { replaceUrl: true });
  }

  toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
  }
}
