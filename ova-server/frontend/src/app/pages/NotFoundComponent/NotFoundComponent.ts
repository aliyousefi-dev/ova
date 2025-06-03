import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 class="text-5xl font-bold mb-4">404</h1>
      <p class="text-xl mb-6">Page not found</p>
      <a routerLink="/" class="btn btn-primary">Go Home</a>
    </div>
  `,
})
export class NotFoundComponent {}
