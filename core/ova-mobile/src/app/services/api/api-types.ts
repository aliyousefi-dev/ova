export interface ApiResponse<T> {
  data: T;
  message: string;
  status: string;
}

export interface PlaylistData {
  title: string;
  description?: string;
  videoIds: string[];
  slug: string;
  Order: number;
}

export interface PlaylistDataResponse {
  playlists: PlaylistData[];
  username: string;
}

export interface Codecs {
  format: string; // e.g., "video/mp4"
  video: string; // e.g., "avc1.64001F"
  audio: string; // e.g., "mp4a.40.2"
}

export interface VideoResolution {
  width: number;
  height: number;
}

export interface VideoData {
  videoId: string;
  title: string;
  description: string;
  filePath: string;
  rating: number;
  durationSeconds: number;
  thumbnailPath?: string | null;
  previewPath?: string | null;
  tags: string[];
  views: number;
  resolution: VideoResolution;
  uploadedAt: string; // ISO 8601 string
  codecs: Codecs;
}
