package datatypes

import (
	"time"
)

// VideoCodecs holds the full format (container + mime type) and separated video/audio codec strings.
type VideoCodecs struct {
	Format      string          `json:"format"`      // Video File Extension
	DurationSec int             `json:"durationSec"` // Video duration in seconds
	FrameRate   float64         `json:"frameRate"`   // Frames per second
	IsFragment  bool            `json:"isFragment"`  // Check if it's fragmented or not
	Resolution  VideoResolution `json:"resolution"`  // Resolution (width x height)
	VideoCodec  string          `json:"videoCodec"`  // Video codec (e.g., avc1.640032)
	AudioCodec  string          `json:"audioCodec"`  // Audio codec (e.g., mp4a.40.2)
}

// VideoResolution defines the width and height of a video.
type VideoResolution struct {
	Width  int `json:"width"`
	Height int `json:"height"`
}

// VideoData represents a single video entry.
type VideoData struct {
	VideoID        string      `json:"videoId"`        // Unique identifier for the video
	FileName       string      `json:"fileName"`       // Title of the video
	Description    string      `json:"description"`    // Added for richer data
	OwnedSpace     string      `json:"ownedSpace"`     // Space where the video is owned
	OwnedGroup     string      `json:"ownedGroup"`     // Group where the video is owned
	Tags           []string    `json:"tags"`           // Tags for categorization and search
	Codecs         VideoCodecs `json:"codecs"`         // Codec information
	IsCooked       bool        `json:"isCooked"`       // Indicates if the video is processed (cooked)
	TotalDownloads int         `json:"totalDownloads"` // Number of downloads
	UploadedAt     time.Time   `json:"uploadedAt"`     // Timestamp of upload
}

// NewVideoData returns an initialized VideoData struct.
// Renamed for clarity and added 'Description' field.
func NewVideoData(videoID string) VideoData {
	return VideoData{
		VideoID:     videoID,
		FileName:    "",
		Description: "",
		OwnedGroup:  "root",
		Tags:        []string{},
		UploadedAt:  time.Now().UTC(),
		Codecs:      VideoCodecs{}, // zero value
	}
}
