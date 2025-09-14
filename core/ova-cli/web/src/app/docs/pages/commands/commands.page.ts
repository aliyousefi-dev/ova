import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodePreviewComponent } from '../../code-preview/code-preview';

@Component({
  selector: 'doc-commands',
  standalone: true,
  imports: [CommonModule, FormsModule, CodePreviewComponent],
  templateUrl: './commands.page.html',
})
export class DocCommands {
  ovaCommands = `
- ovacli init [path]
- ovacli index
- ovacli cook
- ovacli purge
- ovacli configs
- ovacli serve <repo-path>
- ovacli tsconverter <path> 
- ovacli ssl generate-ca
- ovacli ssl generate-cert
- ovacli version
  `;
}
