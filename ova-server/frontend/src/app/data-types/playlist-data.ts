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
