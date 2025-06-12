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

type VideoResolution struct {
	Width  int `json:"width"`
	Height int `json:"height"`
}

type VideoData struct {
	VideoID       string          `json:"videoId"`
	Title         string          `json:"title"`
	FilePath      string          `json:"filePath"`
	Rating        float64         `json:"rating"`
	Duration      int             `json:"durationSeconds"`
	ThumbnailPath *string         `json:"thumbnailPath"`
	PreviewPath   *string         `json:"previewPath"`
	Tags          []string        `json:"tags"`
	Views         int             `json:"views"`
	Resolution    VideoResolution `json:"resolution"`
	UploadedAt    time.Time       `json:"uploadedAt"`
	Codecs        Codecs          `json:"codecs"` // includes Format, Video, Audio
}

func GenerateVideoJSON(
	videoID string,
	title string,
	duration int,
	filePath string,
	thumbnailPath *string,
	previewPath *string,
	resolution VideoResolution,
	codecs Codecs, // e.g. "video/mp4; codecs=\"avc1.64001F, mp4a.40.2\""
) VideoData {

	return VideoData{
		VideoID:       videoID,
		Title:         title,
		FilePath:      filePath,
		Rating:        0,
		Duration:      duration,
		ThumbnailPath: thumbnailPath,
		PreviewPath:   previewPath,
		Tags:          []string{},
		UploadedAt:    time.Now().UTC(),
		Views:         0,
		Resolution:    resolution,
		Codecs:        codecs,
	}
}
