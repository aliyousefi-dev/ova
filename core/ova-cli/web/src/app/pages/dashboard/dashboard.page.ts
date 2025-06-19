import { Component, HostListener, OnInit } from '@angular/core';
import { FolderApiService } from '../../services/api/folder=api.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from '../../components/common/navbar/navbar.component';
import { UploadVideoComponent } from './upload-video.component';
import { UserListComponent } from './user-list.component';
import { CreateUserComponent } from './create-user.component';

@Component({
  selector: 'app-upload',
  templateUrl: './dashboard.page.html',
  standalone: true,
  imports: [
    CommonModule,
    NavBarComponent,
    UploadVideoComponent,
    UserListComponent,
    CreateUserComponent,
  ],
})
export class DashboardPage implements OnInit {
  selectedFolder = '';
  sidebarOpen = false;
  isMobile = false;
  activeTab: string = 'upload'; // default tab

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateIsMobile();
    this.selectedFolder = ''; // default to root or empty
  }

  @HostListener('window:resize')
  updateIsMobile() {
    this.isMobile = window.innerWidth < 768;
    if (!this.isMobile) this.sidebarOpen = true;
  }

  onFolderSelected(folder: string) {
    this.selectedFolder = folder;
  }
}
