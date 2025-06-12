export interface VideoData {
  videoId: string;
  title: string;
  filePath: string;
  rating: number;
  durationSeconds: number;
  thumbnailPath?: string | null; // Optional (nullable)
  previewPath?: string | null; // Optional (nullable)
  tags: string[];
  views: number;
  width: number;
  height: number;
  uploadedAt: string; // ISO 8601 string (e.g., from time.Time in Go)
  mimeType: string; // New field
}
