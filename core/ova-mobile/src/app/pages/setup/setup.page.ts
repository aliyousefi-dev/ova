import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatusApiService } from 'src/app/services/status-api.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ServerConfigService } from 'src/app/services/server-config.service';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonInput,
  IonItem,
  IonLabel,
  IonButton,
} from '@ionic/angular/standalone';
import { Preferences } from '@capacitor/preferences';
import { Router } from '@angular/router';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.page.html',
  styleUrls: ['./setup.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonInput,
    IonItem,
    IonLabel,
    IonButton,
    CommonModule,
    FormsModule,
  ],
})
export class SetupPage implements OnInit {
  serverHost: string = 'localhost'; // Default value
  serverPort: number | null = 4040; // Default value
  serverUser: string = '';
  serverPass: string = '';

  constructor(
    private router: Router,
    private statusApi: StatusApiService,
    private serverConfig: ServerConfigService // <-- add this
  ) {}

  ngOnInit() {}

  async saveSettings() {
    const fullUrl = `http://${this.serverHost}:${this.serverPort}/api/v1`;

    this.statusApi
      .getServerStatus(fullUrl)
      .pipe(
        catchError((err) => {
          alert('Failed to reach server at ' + fullUrl);
          return of(null); // return observable with null so subscription completes
        })
      )
      .subscribe(async (status) => {
        if (status) {
          // Server is reachable, save preferences and navigate
          await Preferences.set({
            key: 'server_url',
            value: fullUrl,
          });
          await Preferences.set({ key: 'server_user', value: this.serverUser });
          await Preferences.set({ key: 'server_pass', value: this.serverPass });

          await this.serverConfig.loadServerUrl(); // <-- ensure in-memory value is updated

          this.router.navigateByUrl('/tabs', { replaceUrl: true });
        }
      });
  }
}
