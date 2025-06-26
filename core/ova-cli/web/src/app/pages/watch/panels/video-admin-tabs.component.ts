import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagManagementPanelComponent } from './tag-management-panel.component';
import { MarkerEditPanelComponent } from './marker-edit-panel.component';
import { LucideAngularModule, CircleUserRound } from 'lucide-angular';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-video-admin-tabs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TagManagementPanelComponent,
    MarkerEditPanelComponent,
    LucideAngularModule,
  ],
  templateUrl: './video-admin-tabs.component.html',
})
export class VideoAdminTabsComponent {
  @Input() videoId!: string;
  @Input() currentTags: string[] = [];
  @Output() tagsUpdated = new EventEmitter<string[]>();
  @Output() addMarkerClicked = new EventEmitter<void>();
  @ViewChild(MarkerEditPanelComponent) markerPanel!: MarkerEditPanelComponent;

  readonly AdminIcon = CircleUserRound;

  selectedTab: 'tag' | 'marker' = 'tag';

  persistTab(tab: 'tag' | 'marker') {
    this.selectedTab = tab;
    localStorage.setItem('admin_tab', tab);
  }

  // Public method to add marker by seconds
  addMarkerBySeconds(seconds: number) {
    if (this.markerPanel) {
      this.markerPanel.addMarkerBySeconds(seconds);
    }
  }

  ngOnInit() {
    const saved = localStorage.getItem('admin_tab');
    if (saved === 'tag' || saved === 'marker') {
      this.selectedTab = saved;
    }
  }
}
