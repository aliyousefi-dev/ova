import { Routes } from '@angular/router';
import { DocOverviewPage } from '../docs/pages/doc-overview/doc-overview.page';
import { DocAPIPage } from '../docs/pages/doc-api/doc-api.page';
import { DocQuickStartPage } from '../docs/pages/doc-quickstart/doc-quickstart.page';
import { DocRepositoryPage } from '../docs/pages/doc-repository/doc-repository.page';
import { DocSelfCertPage } from '../docs/pages/doc-selfcert/doc-selfcert.page';
import { DocBucketFetchPage } from '../docs/pages/doc-bucket-fetch/doc-bucket-fetch.page';
import { DocBBatchAPIPage } from '../docs/pages/doc-batch-api/doc-batch-api.page';

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
    path: 'bucket-fetch',
    component: DocBucketFetchPage,
  },
  {
    path: 'batch-api',
    component: DocBBatchAPIPage,
  },
  {
    path: 'repository',
    component: DocRepositoryPage,
  },
  {
    path: 'self-certs',
    component: DocSelfCertPage,
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
