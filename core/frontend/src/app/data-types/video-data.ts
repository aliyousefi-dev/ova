export interface VideoData {
  videoId: string;
  title: string;
  filePath: string;
  rating: number;
  durationSeconds: number;
  thumbnailPath: string;
  previewPath: string;
  tags: string[];
  views: number;
  width: number;
  height: number;
  uploadedAt: string; // ISO date string
}
