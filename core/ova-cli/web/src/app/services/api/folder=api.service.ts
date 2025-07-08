import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../data-types/responses';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FolderApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getFolderLists(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.baseUrl}/folders`, {
      withCredentials: true,
    });
  }
}
