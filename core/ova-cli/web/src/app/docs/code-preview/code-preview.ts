import { Component, ViewEncapsulation, Input, OnInit } from '@angular/core';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { createHighlighter } from 'shiki';
import { DomSanitizer } from '@angular/platform-browser';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) {}
  transform(value: string) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}

@Component({
  selector: 'code-preview',
  templateUrl: './code-preview.html',
  imports: [ClipboardModule, SafeHtmlPipe],
  encapsulation: ViewEncapsulation.None,
})
export class CodePreviewComponent implements OnInit {
  @Input() codeContent: string = '';
  tooltipText: string = 'Copy';
  highlightedCode: string = ''; // Holds the highlighted HTML code

  async ngOnInit() {
    const highlighter = await createHighlighter({
      themes: ['slack-dark'],
      langs: ['bash'],
    });

    // Use codeContent instead of hardcoded string
    this.highlightedCode = highlighter.codeToHtml(this.codeContent, {
      lang: 'bash',
      theme: 'slack-dark',
    });
  }

  // Method to copy code content to clipboard
  copyToClipboard() {
    this.tooltipText = 'Copied!';

    // Revert the tooltip text after 1 second
    setTimeout(() => {
      this.tooltipText = 'Copy';
    }, 1000);
  }
}
