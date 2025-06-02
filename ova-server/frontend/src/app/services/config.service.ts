import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private config: any = null;

  constructor(private http: HttpClient) {}

  loadConfig(): Promise<void> {
    return this.http
      .get('/config/production.json')
      .toPromise()
      .then((data) => {
        this.config = data;
      });
  }

  get apiUrl(): string {
    return this.config?.APIUrl || '';
  }
}
