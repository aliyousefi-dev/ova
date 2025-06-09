import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { VideoCardComponent } from '../../components/video-card/video-card.component';
import { VideoData } from '../../data-types/video-data';
import { VideoApiService } from '../../services/video-api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    CommonModule,
    FormsModule,
    VideoCardComponent,
  ],
})
export class HomePage implements OnInit {
  videos: VideoData[] = [];
  username = 'demoUser';
  favorites = ['abc123'];

  constructor(private videoApi: VideoApiService) {}

  ngOnInit() {
    this.fetchAllVideos();
  }

  fetchAllVideos() {
    this.videoApi.getFolderLists().subscribe({
      next: (foldersResp) => {
        const folders = foldersResp.data || [];
        if (!folders.length) {
          this.videos = [];
          return;
        }
        let allVideos: VideoData[] = [];
        let completed = 0;
        folders.forEach((folder) => {
          this.videoApi.getVideosByFolder(folder).subscribe({
            next: (videosResp) => {
              if (videosResp.data) {
                allVideos = allVideos.concat(videosResp.data);
              }
              completed++;
              if (completed === folders.length) {
                this.videos = allVideos;
              }
            },
            error: () => {
              completed++;
              if (completed === folders.length) {
                this.videos = allVideos;
              }
            },
          });
        });
      },
      error: () => {
        this.videos = [];
      },
    });
  }

  handleRefresh(event: CustomEvent) {
    this.videoApi.getFolderLists().subscribe({
      next: (foldersResp) => {
        const folders = foldersResp.data || [];
        if (!folders.length) {
          this.videos = [];
          (event.target as HTMLIonRefresherElement).complete();
          return;
        }
        let allVideos: VideoData[] = [];
        let completed = 0;
        folders.forEach((folder) => {
          this.videoApi.getVideosByFolder(folder).subscribe({
            next: (videosResp) => {
              if (videosResp.data) {
                allVideos = allVideos.concat(videosResp.data);
              }
              completed++;
              if (completed === folders.length) {
                this.videos = allVideos;
                (event.target as HTMLIonRefresherElement).complete();
              }
            },
            error: () => {
              completed++;
              if (completed === folders.length) {
                this.videos = allVideos;
                (event.target as HTMLIonRefresherElement).complete();
              }
            },
          });
        });
      },
      error: () => {
        this.videos = [];
        (event.target as HTMLIonRefresherElement).complete();
      },
    });
  }
}
