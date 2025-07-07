import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Import the sub-components
import { IndexedVideoTabComponent } from './components/indexed-video-tab/indexed-video-tab.component';
import { DiskVideoTabComponent } from './components/disk-video-tab/disk-video-tab.component';
import { UnindexedVideoTabComponent } from './components/unindexed-video-tab/unindexed-video-tab.component';

@Component({
  selector: 'app-videos-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IndexedVideoTabComponent,
    DiskVideoTabComponent,
    UnindexedVideoTabComponent,
  ],
  templateUrl: './videos-tab.component.html',
})
export class VideosTabComponent implements OnInit, OnChanges {
  @Input() repositoryAddress: string = '';

  activeTab: string = 'indexedVideo'; // Default active tab

  loading: boolean = false; // This remains for any high-level parent loading if desired

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    // Children will react to repositoryAddress changes via their own ngOnChanges
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
