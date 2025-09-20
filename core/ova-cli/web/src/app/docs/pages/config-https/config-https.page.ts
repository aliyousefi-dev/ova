import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-doc-config-https-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './config-https.page.html',
})
export class DocConfigHttpsPage {
  commands = `
  ovacli ssl

  Available Commands:
  generate-ca   Generate the RSA key and CA certificate in the SSL folder
  generate-cert Generate a certificate using the CA's key and certificate`;
}
