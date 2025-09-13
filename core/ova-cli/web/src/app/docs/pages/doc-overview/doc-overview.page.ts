import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OvaLogoComponent } from '../../../components/utility/ova-logo/ova-logo.component';

@Component({
  selector: 'app-doc-overview-page',
  standalone: true,
  imports: [CommonModule, FormsModule, OvaLogoComponent],
  templateUrl: './doc-overview.page.html',
})
export class DocOverviewPage {}
