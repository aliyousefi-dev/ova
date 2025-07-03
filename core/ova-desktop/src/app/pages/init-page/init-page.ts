import { Component, NO_ERRORS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-init-page',
  templateUrl: './init-page.html',
  schemas: [NO_ERRORS_SCHEMA], // Allow unrecognized elements like <webview>
})
export class InitPage {
  constructor() {
    // Any initialization logic you may need
  }
}
