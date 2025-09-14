import { Component, Input } from '@angular/core';
import { ClipboardModule } from '@angular/cdk/clipboard';

@Component({
  selector: 'code-preview',
  templateUrl: './code-preview.html',
  imports: [ClipboardModule],
})
export class CodePreviewComponent {
  @Input() codeContent: any;
  tooltipText: string = 'Copy';

  // Method to copy code content to clipboard
  copyToClipboard() {
    this.tooltipText = 'Copied!';

    // Revert the tooltip text after 1 second
    setTimeout(() => {
      this.tooltipText = 'Copy';
    }, 1000);
  }
}
