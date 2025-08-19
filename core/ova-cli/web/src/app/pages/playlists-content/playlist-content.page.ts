import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GalleryFetcherComponent } from '../../components/manager/gallery-fetcher/gallery-fetcher.component';

@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, GalleryFetcherComponent],
  templateUrl: './playlist-content.page.html',
})
export class PlaylistContentPage implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}
  playlistTitle = '';

  ngOnInit() {
    // Assuming playlist title is passed as route param 'title'
    this.route.paramMap.subscribe((params) => {
      const title = params.get('title');
      if (title) {
        this.playlistTitle = title;
      } else {
        this.router.navigate(['/playlists']);
      }
    });
  }
}
