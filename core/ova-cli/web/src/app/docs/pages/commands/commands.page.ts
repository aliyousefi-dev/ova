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
  initCommand = 'ovacli init <path>';
  indexCommand = 'ovacli index';
  cookCommand = 'ovacli cook';
  purgeCommand = 'ovacli purge';
  serveCommand = 'ovacli serve <repo-path>';
  versionCommand = 'ovacli version';

  configsCommand = 'ovacli configs';
  configsDefaultCommand = 'ovacli configs default';
  configsResetCommand = 'ovacli configs reset';

  tsconverterCommand = 'ovacli tsconverter <path>';

  sslGenerateCaCommand = 'ovacli ssl generate-ca';
  sslGenerateCertCommand = 'ovacli ssl generate-cert';
}
