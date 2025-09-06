import { Routes } from '@angular/router';
import { LibraryPage } from './pages/library/library.page';
import { WatchPage } from './pages/watch/watch.page';
import { NotFoundPage } from './pages/404/404.page';
import { HomePage } from './pages/home/home.page';
import { LoginPage } from './pages/login/login.page';
import { AuthGuard } from './services/auth.guard';
import { SavedPage } from './pages/saved/saved.page';
import { PlaylistsPage } from './pages/playlists/playlists.page';
import { PlaylistContentPage } from './pages/playlists-content/playlist-content.page';
import { SearchPage } from './pages/search/search.page';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { ProfilePage } from './pages/profile/profile.page';
import { HistoryPage } from './pages/history/history.page';
import { GlobalPage } from './pages/global/global.page';
import { UploadPage } from './pages/upload/upload.page';
import { CreateSpacePage } from './pages/create-space/create-space.page';
import { CreateTeamSpacePage } from './pages/create-team-space/create-team-space.page';
import { JoinTeamSpacePage } from './pages/join-team-space/join-team-space.page';
import { SettingsPage } from './pages/settings/settings.page';
import { GeneralSettingsComponent } from './pages/settings/panels/general-settings/general-settings.component';
import { AppearanceSettingsComponent } from './pages/settings/panels/appearance-settings/appearance-settings.component';
import { AddonsSettingsComponent } from './pages/settings/panels/addons-settings/addons-settings.component';
import { SecuritySettingsComponent } from './pages/settings/panels/security-settings/security-settings.component';
import { MaterialsPage } from './pages/materials/materials.page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
    canActivate: [AuthGuard],
  },
  {
    path: 'global',
    component: GlobalPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'history',
    component: HistoryPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'spaces',
    component: LibraryPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'watch/:videoId',
    component: WatchPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard',
    component: DashboardPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'create-space',
    component: CreateSpacePage,
    canActivate: [AuthGuard],
  },
  {
    path: 'create-team-space',
    component: CreateTeamSpacePage,
    canActivate: [AuthGuard],
  },
  {
    path: 'join-team-space',
    component: JoinTeamSpacePage,
    canActivate: [AuthGuard],
  },
  {
    path: 'upload',
    component: UploadPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    component: ProfilePage,
    canActivate: [AuthGuard],
  },
  {
    path: 'saved',
    component: SavedPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'settings',
    component: SettingsPage,
    children: [
      { path: 'appearance', component: AppearanceSettingsComponent },
      { path: 'security', component: SecuritySettingsComponent },
      { path: 'addons', component: AddonsSettingsComponent },
      { path: 'general', component: GeneralSettingsComponent },
      { path: '', redirectTo: 'profile', pathMatch: 'full' }, // default
    ],
  },
  {
    path: 'search',
    component: SearchPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'playlists',
    component: PlaylistsPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'materials',
    component: MaterialsPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'playlists/:title',
    component: PlaylistContentPage,
    canActivate: [AuthGuard],
  },

  // Public routes outside the layout shell
  {
    path: 'login',
    component: LoginPage,
  },
  {
    path: '**',
    component: NotFoundPage,
  },
];
