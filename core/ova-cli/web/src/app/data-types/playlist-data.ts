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
