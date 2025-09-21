import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodePreviewComponent } from '../../code-preview/code-preview';

@Component({
  selector: 'doc-configs-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CodePreviewComponent],
  templateUrl: './configs.page.html',
})
export class DocConfigsPage {
  ovaCommands = `{
	"version": "1.0.0",
	"serverHost": "0.0.0.0",
	"serverPort": 443,
	"rootUser": "user",
	"enableAuthentication": true,
	"enableDocs": true,
	"maxBucketSize": 15,
	"dataStorageType": "jsondb",
	"createdAt": "2025-08-12T19:49:16.9240393+03:30"
}`;

  resetConfigCommand = `ovacli configs reset`;
}
