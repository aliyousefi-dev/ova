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
import { LucideAngularModule, CircleUserRound } from 'lucide-angular';

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
export class VideoAdminTabsComponent implements OnInit {
  @Input() videoId!: string;
  @Input() currentTags: string[] = [];
  @Output() tagsUpdated = new EventEmitter<string[]>();
  @Output() addMarkerClicked = new EventEmitter<void>();
  @ViewChild(MarkerEditPanelComponent) markerPanel!: MarkerEditPanelComponent;

  readonly AdminIcon = CircleUserRound;

  selectedTab: 'tag' | 'marker' = 'tag';

  showAdminPanel = false;

  persistTab(tab: 'tag' | 'marker') {
    this.selectedTab = tab;
    localStorage.setItem('admin_tab', tab);
  }

  toggleAdminPanel() {
    this.showAdminPanel = !this.showAdminPanel;
    localStorage.setItem(
      'show_admin_panel',
      this.showAdminPanel ? 'true' : 'false'
    );
  }

  // Public method to add marker by seconds
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

    const savedPanel = localStorage.getItem('show_admin_panel');
    this.showAdminPanel = savedPanel === 'true';
  }
}
