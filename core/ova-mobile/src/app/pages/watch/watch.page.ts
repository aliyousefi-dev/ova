import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
} from '@ionic/angular/standalone';
import { VideoApiService } from '../../services/video-api.service';

@Component({
  selector: 'app-watch',
  templateUrl: './watch.page.html',
  standalone: true,
  imports: [IonContent, IonHeader, IonToolbar, IonTitle, CommonModule],
})
export class WatchPage implements OnInit {
  videoId: string = '';
  streamUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private videoApi: VideoApiService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.videoId = params.get('videoId') || '';
      if (this.videoId) {
        this.streamUrl = this.videoApi.getStreamUrl(this.videoId);
      }
    });
  }
}
