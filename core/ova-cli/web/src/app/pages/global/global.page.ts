import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlobalVideosComponent } from './panels/global-videos/global-videos.component';
import { GlobalSpacesComponent } from './panels/global-spaces/global-spaces.component';

@Component({
  selector: 'app-global-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GlobalVideosComponent,
    GlobalSpacesComponent,
  ],
  templateUrl: './global.page.html',
})
export class GlobalPage {}
