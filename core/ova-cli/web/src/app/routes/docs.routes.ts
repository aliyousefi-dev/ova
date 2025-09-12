import { Routes } from '@angular/router';
import { DocOverviewPage } from '../docs/doc-overview/doc-overview.page';
import { DocAPIPage } from '../docs/doc-api/doc-api.page';
import { DocQuickStartPage } from '../docs/doc-quickstart/doc-quickstart.page';

export const DocsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full',
  },
  {
    path: 'overview',
    component: DocOverviewPage,
  },
  {
    path: 'api',
    component: DocAPIPage,
  },
  {
    path: 'quickstart',
    component: DocQuickStartPage,
  },
];
