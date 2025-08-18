import { Routes } from '@angular/router';
import { App } from './app';

export const routes: Routes = [
  {
    path: ':file', // This will match any file path, e.g., /api-endpoints.md
    component: App, // Root component that will handle loading the markdown
  },
  {
    path: '', // Default route
    component: App, // Default markdown page, e.g., index.md
  },
];
