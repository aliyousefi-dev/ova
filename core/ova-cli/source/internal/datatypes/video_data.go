package datatypes

import (
	"time"
)

// VideoCodecs holds the full format (container + mime type) and separated video/audio codec strings.
type VideoCodecs struct {
	Container   string          `json:"format"`     // e.g., "video/mp4" (full mime type without codecs part)
	VideoCodect string          `json:"video"`      // e.g., "avc1.64001F"
	AudioCodect string          `json:"audio"`      // e.g., "mp4a.40.2"
	Resolution  VideoResolution `json:"resolution"` // Video resolution (width, height)
	FrameRate   float64         `json:"frameRate"`  // Frame rate (frames per second)
}

// VideoResolution defines the width and height of a video.
type VideoResolution struct {
	Width  int `json:"width"`
	Height int `json:"height"`
}

// VideoData represents a single video entry.
type VideoData struct {
	VideoID         string      `json:"videoId"`         // Unique identifier for the video
	Title           string      `json:"title"`           // Title of the video
	Description     string      `json:"description"`     // Added for richer data
	FilePath        string      `json:"filePath"`        // Path to the main video file
	PrimarySpace    string      `json:"primarySpace"`    // Primary space for the video
	LinkedSpaces    []string    `json:"linkedSpaces"`    // Linked spaces for the video
	DurationSeconds int         `json:"durationSeconds"` // Duration in seconds
	Tags            []string    `json:"tags"`            // Tags for categorization and search
	UploadedAt      time.Time   `json:"uploadedAt"`      // Timestamp of upload
	Codecs          VideoCodecs `json:"codecs"`          // Codec information
	TotalDownloads  int         `json:"totalDownloads"`  // Number of downloads
}

// NewVideoData returns an initialized VideoData struct.
// Renamed for clarity and added 'Description' field.
func NewVideoData(videoID string) VideoData {
	return VideoData{
		VideoID:         videoID,
		Title:           "",
		Description:     "",
		FilePath:        "",
		DurationSeconds: 0,
		Tags:            []string{},
		UploadedAt:      time.Now().UTC(),
		Codecs:          VideoCodecs{}, // zero value
	}
}
