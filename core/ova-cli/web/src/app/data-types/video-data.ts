export interface VideoCodecs {
  format: string; // Video file extension (e.g., ".mp4")
  durationSec: number; // Video duration in seconds
  frameRate: number; // Frames per second
  isFragment: boolean; // Check if it's fragmented or not
  resolution: Resolution;
  videoCodec: string; // Video codec (e.g., "avc1.64001F")
  audioCodec: string; // Audio codec (e.g., "mp4a.40.2")
}

export interface Resolution {
  width: number; // Width of the video
  height: number; // Height of the video
}

export interface VideoData {
  videoId: string; // Unique video ID (e.g., "17299d50dbf02fa79c30baa57d0078c1838238b88f10b74aa2e063975c8776f2")
  fileName: string; // Name of the video file (e.g., "Hello World")
  description: string; // Description of the video
  ownedSpace: string; // Owned space for the video (e.g., ".")
  ownedGroup: string; // Group that owns the video
  tags: string[]; // Tags associated with the video
  uploadedAt: string; // ISO 8601 date string when the video was uploaded (e.g., "2025-08-20T18:29:36.050242Z")
  totalDownloads: number; // Total number of downloads
  codecs: VideoCodecs; // Codec details for the video
  isCooked: boolean; // Indicates if the video is processed (cooked)
}
