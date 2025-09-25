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
import { DocChangelogPage } from './pages/changelog/changelog.page';
import { DocRoadmapPage } from './pages/roadmap/roadmap.page';
import { DocAuthenticationPage } from './pages/authentication/authentication.page';
import { DocTsConvertorPage } from './pages/tsconvertor/tsconvertor.page';
import { DocVideoCardPage } from './pages/video-card/video-card.page';
import { DocConfigsPage } from './pages/configs/configs.page';
import { DocVideoInfoPage } from './pages/video-info/video-info.page';
import { DocStreamAPIPage } from './pages/stream-api/doc-stream-api.page';
import { DocFeatsToDevPage } from './pages/feat-to-dev/feat-to-dev.page';
import { DocConfigHttpsPage } from './pages/config-https/config-https.page';
import { DocTrimServerPage } from './pages/trim-server/trim-server.page';
import { DocDownloadServerPage } from './pages/download-server/download-server.page';
import { DocPlatformsPage } from './pages/platforms/platforms.page';
import { DocSimilarVideosPage } from './pages/similar-videos/similar-videos.page';
import { DocVideoTagsPage } from './pages/video-tags/video-tags.page';
import { DocAIRecomendationPage } from './pages/ai-recomendation/ai-recomendation.page';
import { DocDataStoragePage } from './pages/datastorage/datastorage.page';
import { DocCustomThemePage } from './pages/custom-theme/custom-theme.page';
import { DocChecksumPage } from './pages/checksum/checksum.page';

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
    path: 'datastorage',
    component: DocDataStoragePage,
  },
  {
    path: 'checksum',
    component: DocChecksumPage,
  },
  {
    path: 'custom-theme',
    component: DocCustomThemePage,
  },
  {
    path: 'ai-recomendation',
    component: DocAIRecomendationPage,
  },
  {
    path: 'video-tags',
    component: DocVideoTagsPage,
  },
  {
    path: 'similar-videos',
    component: DocSimilarVideosPage,
  },
  {
    path: 'changelog',
    component: DocChangelogPage,
  },
  {
    path: 'platforms',
    component: DocPlatformsPage,
  },
  {
    path: 'trim-server',
    component: DocTrimServerPage,
  },
  {
    path: 'download-server',
    component: DocDownloadServerPage,
  },
  {
    path: 'feats-to-dev',
    component: DocFeatsToDevPage,
  },
  {
    path: 'roadmap',
    component: DocRoadmapPage,
  },
  {
    path: 'config-https',
    component: DocConfigHttpsPage,
  },
  {
    path: 'tools/video-info',
    component: DocVideoInfoPage,
  },
  {
    path: 'configs',
    component: DocConfigsPage,
  },
  {
    path: 'components/video-card',
    component: DocVideoCardPage,
  },
  {
    path: 'tools/tsconvertor',
    component: DocTsConvertorPage,
  },
  {
    path: 'authentication',
    component: DocAuthenticationPage,
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
    path: 'stream-api',
    component: DocStreamAPIPage,
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
