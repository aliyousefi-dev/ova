import { PlaylistData } from './playlist-data';
import { VideoData } from './video-data';

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: string;
}

export interface PlaylistResponse {
  data: PlaylistData | { playlists: PlaylistData[]; username: string };
  message: string;
  status: string;
}

export interface LoginResponse {
  data: {
    sessionId: string;
  };
  message: string;
  status: string;
}

export interface SearchResponse {
  query: string;
  results: VideoData[];
}

export interface FavoritesResponse {
  username: string;
  favorites: string[];
}

export interface AuthStatusResponse {
  authenticated: boolean;
  username?: string;
}
