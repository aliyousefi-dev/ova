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
#commong
- ovacli init [path]
- ovacli index
- ovacli cook
- ovacli purge
- ovacli serve <repo-path>
- ovacli version

#configs
- ovacli configs
- ovacli configs default
- ovacli configs reset

#tools
- ovacli tsconverter <path>

#ssl
- ovacli ssl generate-ca
- ovacli ssl generate-cert

  `;
}
