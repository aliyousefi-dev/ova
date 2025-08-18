import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlaylistManagerComponent } from '../../components/manager/playlist-manager/playlist-manager.component';

@Component({
  selector: 'app-playlists',
  standalone: true,
  imports: [CommonModule, PlaylistManagerComponent],
  templateUrl: './playlists.page.html',
})
export class PlaylistsPage {}
