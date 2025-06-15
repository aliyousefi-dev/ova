package datatypes

import (
	"time"
)

// Codecs holds the full format (container + mime type) and separated video/audio codec strings.
type Codecs struct {
	Format string `json:"format"` // e.g., "video/mp4" (full mime type without codecs part)
	Video  string `json:"video"`  // e.g., "avc1.64001F"
	Audio  string `json:"audio"`  // e.g., "mp4a.40.2"
}

// VideoResolution defines the width and height of a video.
type VideoResolution struct {
	Width  int `json:"width"`
	Height int `json:"height"`
}

// VideoData represents a single video entry.
type VideoData struct {
	VideoID         string          `json:"videoId"`                 // Unique identifier for the video
	Title           string          `json:"title"`                   // Title of the video
	Description     string          `json:"description"`             // Added for richer data
	FilePath        string          `json:"filePath"`                // Path to the main video file
	Rating          float64         `json:"rating"`                  // Average user rating (e.g., 0.0 to 5.0)
	DurationSeconds int             `json:"durationSeconds"`         // Duration in seconds
	ThumbnailPath   *string         `json:"thumbnailPath,omitempty"` // Optional path to thumbnail image
	PreviewPath     *string         `json:"previewPath,omitempty"`   // Optional path to video preview
	Tags            []string        `json:"tags"`                    // Tags for categorization and search
	Views           int             `json:"views"`                   // Number of views
	Resolution      VideoResolution `json:"resolution"`              // Video resolution (width, height)
	UploadedAt      time.Time       `json:"uploadedAt"`              // Timestamp of upload
	Codecs          Codecs          `json:"codecs"`                  // Codec information
}

// NewVideoData returns an initialized VideoData struct.
// Renamed for clarity and added 'Description' field.
func NewVideoData(
	videoID string,
	title string,
	duration int,
	filePath string,
	thumbnailPath *string,
	previewPath *string,
	resolution VideoResolution,
	codecs Codecs,
) VideoData {
	return VideoData{
		VideoID:         videoID,
		Title:           title,
		Description:     "", // Initialize with empty description
		FilePath:        filePath,
		Rating:          0, // Default rating
		DurationSeconds: duration,
		ThumbnailPath:   thumbnailPath,
		PreviewPath:     previewPath,
		Tags:            []string{},       // Initialize with empty slice
		UploadedAt:      time.Now().UTC(), // Set upload time to now in UTC
		Views:           0,                // Initial views
		Resolution:      resolution,
		Codecs:          codecs,
	}
}
