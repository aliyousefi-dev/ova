import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagManagementPanelComponent } from './tag-management-panel.component';
import { MarkerEditPanelComponent } from './marker-edit-panel.component';

@Component({
  selector: 'app-video-admin-tabs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TagManagementPanelComponent,
    MarkerEditPanelComponent,
  ],
  templateUrl: './video-admin-tabs.component.html',
})
export class VideoAdminTabsComponent implements OnInit {
  @Input() videoId!: string;
  @Input() currentTags: string[] = [];
  @Output() tagsUpdated = new EventEmitter<string[]>();
  @Output() addMarkerClicked = new EventEmitter<void>();
  @ViewChild(MarkerEditPanelComponent) markerPanel!: MarkerEditPanelComponent;

  selectedTab: 'tag' | 'marker' = 'tag';

  // Remove toggle state
  // showAdminPanel = false;

  persistTab(tab: 'tag' | 'marker') {
    this.selectedTab = tab;
    localStorage.setItem('admin_tab', tab);
  }

  // Remove toggle method
  // toggleAdminPanel() { ... }

  addMarkerBySeconds(seconds: number) {
    if (this.markerPanel) {
      this.markerPanel.addMarkerBySeconds(seconds);
    }
  }

  ngOnInit() {
    const savedTab = localStorage.getItem('admin_tab');
    if (savedTab === 'tag' || savedTab === 'marker') {
      this.selectedTab = savedTab;
    }

    // Always show admin panel, so no need to read from localStorage
  }
}
