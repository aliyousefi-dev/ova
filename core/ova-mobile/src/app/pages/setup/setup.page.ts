import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatusApiService } from 'src/app/services/status-api.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
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
  IonAlert,
} from '@ionic/angular/standalone';
import { Preferences } from '@capacitor/preferences';
import { Router } from '@angular/router';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.page.html',
  styleUrls: ['./setup.page.scss'],
  standalone: true,
  imports: [
    IonAlert,
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
  serverHost: string = '192.168.52.106'; // Default value
  serverPort: any = 4040; // Default value
  serverUser: string = '';
  serverPass: string = '';
  public alertButtons = ['OK'];

  constructor(
    private router: Router,
    private statusApi: StatusApiService,
    private serverConfig: ServerConfigService // <-- add this
  ) {}

  ngOnInit() {}

  async saveSettings($event?: Event) {
    if ($event) $event.preventDefault();

    // Convert serverPort to a Number
    const serverPortNumber = Number(this.serverPort);

    console.log(
      'saveSettings called',
      this.serverHost,
      this.serverPort,
      this.serverUser,
      this.serverPass
    ); // Debug log
    const fullUrl = `http://${this.serverHost}:${serverPortNumber}/api/v1`;

    this.statusApi
      .getServerStatus(fullUrl)
      .pipe(
        catchError((err) => {
          console.log('Connection Error: Could not connect to server');
          document.getElementById('connection-alert-trigger')?.click();
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

          localStorage.setItem('server_url', fullUrl); // Also save to localStorage

          await this.serverConfig.loadServerUrl(); // <-- ensure in-memory value is updated

          this.router.navigateByUrl('/tabs', { replaceUrl: true });
        }
      });
  }
}
