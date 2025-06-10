import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet, IonApp } from '@ionic/angular/standalone';
import { StatusBar } from '@capacitor/status-bar';
import { VideoPlayerService } from './services/video-player.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(public videoPlayer: VideoPlayerService) {}

  async ngOnInit() {
    try {
      await StatusBar.setOverlaysWebView({ overlay: false });
    } catch (err) {
      console.warn('StatusBar.setOverlaysWebView failed:', err);
    }
  }
}
