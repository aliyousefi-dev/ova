package datatypes

import (
	"time"
)

// VideoCodecs holds the full format (container + mime type) and separated video/audio codec strings.
type VideoCodecs struct {
	Container   string `json:"format"` // e.g., "video/mp4" (full mime type without codecs part)
	VideoCodect string `json:"video"`  // e.g., "avc1.64001F"
	AudioCodect string `json:"audio"`  // e.g., "mp4a.40.2"
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
	Codecs          VideoCodecs     `json:"codecs"`                  // Codec information
}

// NewVideoData returns an initialized VideoData struct.
// Renamed for clarity and added 'Description' field.
func NewVideoData(videoID string) VideoData {
	return VideoData{
		VideoID:         videoID,
		Title:           "",
		Description:     "",
		FilePath:        "",
		Rating:          0,
		DurationSeconds: 0,
		ThumbnailPath:   nil,
		PreviewPath:     nil,
		Tags:            []string{},
		UploadedAt:      time.Now().UTC(),
		Views:           0,
		Resolution:      VideoResolution{}, // zero value
		Codecs:          VideoCodecs{},     // zero value
	}
}
