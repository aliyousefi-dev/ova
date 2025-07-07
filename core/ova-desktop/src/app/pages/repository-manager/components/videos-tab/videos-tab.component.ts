// videos-tab.component.ts
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
import { DuplicateVideoTabComponent } from './components/duplicate-video-tab/duplicate-video-tab.component'; // Import the new component

@Component({
  selector: 'app-videos-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IndexedVideoTabComponent,
    DiskVideoTabComponent,
    UnindexedVideoTabComponent,
    DuplicateVideoTabComponent, // Add the new component here
  ],
  templateUrl: './videos-tab.component.html',
})
export class VideosTabComponent implements OnInit, OnChanges {
  @Input() repositoryAddress: string = '';

  // Add 'duplicateVideo' to the possible types for activeTab
  activeTab:
    | 'indexedVideo'
    | 'diskVideo'
    | 'unindexedVideo'
    | 'duplicateVideo' = 'indexedVideo'; // Default active tab

  loading: boolean = false; // This remains for any high-level parent loading if desired

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    // Children will react to repositoryAddress changes via their own ngOnChanges
  }

  // Update the type for 'tab' to include 'duplicateVideo'
  setActiveTab(
    tab: 'indexedVideo' | 'diskVideo' | 'unindexedVideo' | 'duplicateVideo'
  ) {
    this.activeTab = tab;
  }
}
