import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'doc-installation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './installation.page.html',
})
export class DocInstallation {}
