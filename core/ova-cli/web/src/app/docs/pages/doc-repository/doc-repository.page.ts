import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-doc-repository-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doc-repository.page.html',
})
export class DocRepositoryPage {}
