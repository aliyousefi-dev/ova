import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet, IonApp } from '@ionic/angular/standalone';
import { StatusBar } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor() {}

  async ngOnInit() {
    try {
      await StatusBar.hide();
    } catch (err) {
      console.warn('StatusBar.setOverlaysWebView failed:', err);
    }
  }
}
