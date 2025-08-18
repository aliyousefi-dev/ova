import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MarkdownService {
  constructor(private http: HttpClient) {}

  // Fetch the markdown content by file path
  getMarkdownContent(filePath: string): Observable<string> {
    return this.http.get(filePath, { responseType: 'text' });
  }
}
