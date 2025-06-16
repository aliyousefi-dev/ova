import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../data-types/responses';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UploadApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  /**
   * Upload a video file to a specific folder
   * @param folderPath Folder path relative to repo root (e.g., "movies/comedy")
   * @param file The video file (File object from input)
   */
  uploadVideo(folderPath: string, file: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('folder', folderPath);
    formData.append('file', file);

    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/upload`,
      formData,
      {
        withCredentials: true,
      }
    );
  }
}
