import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodePreviewComponent } from '../../code-preview/code-preview';

@Component({
  selector: 'app-doc-selfcert-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CodePreviewComponent],
  templateUrl: './doc-selfcert.page.html',
})
export class DocSelfCertPage {
  commands = `
  ovacli ssl

  Available Commands:
  generate-ca   Generate the RSA key and CA certificate in the SSL folder
  generate-cert Generate a certificate using the CA's key and certificate`;
}
