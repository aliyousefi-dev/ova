import { Routes } from '@angular/router';
import { DocOverviewPage } from './pages/overview/overview.page.page';
import { DocAPIPage } from './pages/apis/doc-api.page';
import { DocQuickStartPage } from './pages/quickstart/doc-quickstart.page';
import { DocRepositoryPage } from './pages/repository/doc-repository.page';
import { DocSelfCertPage } from './pages/self-certs/doc-selfcert.page';
import { DocBucketFetchPage } from './pages/bucket-fetch/doc-bucket-fetch.page';
import { DocBBatchAPIPage } from './pages/batch-api/doc-batch-api.page';
import { DocInstallation } from './pages/installation/installation.page';
import { DocCommands } from './pages/commands/commands.page';

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
    path: 'installation',
    component: DocInstallation,
  },
  {
    path: 'commands',
    component: DocCommands,
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
