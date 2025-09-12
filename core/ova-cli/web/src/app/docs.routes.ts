import { Routes } from '@angular/router';
import { DocOverviewPage } from './docs/doc-overview/doc-overview.page';
import { DocAPIPage } from './docs/doc-api/doc-api.page';

export const DocsRoutes: Routes = [
  {
    path: '',
    component: DocOverviewPage,
  },
  {
    path: 'api',
    component: DocAPIPage,
  },
];
