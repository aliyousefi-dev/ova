export interface PlaylistData {
  title: string;
  description?: string;
  videoIds: string[];
  slug: string;
}

export interface PlaylistResponse {
  data: PlaylistData | { playlists: PlaylistData[]; username: string };
  message: string;
  status: string;
}

export interface PlaylistCardModel extends PlaylistData {
  id: string; // unique id or slug for convenience
  thumbnailUrls: string[]; // exactly 4 thumbnails
  previewUrls: string[]; // exactly 4 preview videos
  isFavorite: boolean;
  timeSinceAdded: string;
  totalDurationSeconds: number;
  tags: string[];
}
