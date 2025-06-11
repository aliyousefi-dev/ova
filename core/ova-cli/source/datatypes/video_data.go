package datatypes

import (
	"time"
)

type VideoData struct {
	VideoID       string    `json:"videoId"`
	Title         string    `json:"title"`
	FilePath      string    `json:"filePath"`
	Rating        float64   `json:"rating"`
	Duration      int       `json:"durationSeconds"`
	ThumbnailPath *string   `json:"thumbnailPath"`
	PreviewPath   *string   `json:"previewPath"`
	Tags          []string  `json:"tags"`
	Views         int       `json:"views"`
	Width         int       `json:"width"`
	Height        int       `json:"height"`
	UploadedAt    time.Time `json:"uploadedAt"`
	MimeType      string    `json:"mimeType"` // NEW field
}

func GenerateVideoJSON(
	videoID string,
	title string,
	duration int,
	filePath string,
	thumbnailPath *string,
	previewPath *string,
	width int,
	height int,
	mimeType string, // NEW parameter
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
		Width:         width,
		Height:        height,
		MimeType:      mimeType,
	}
}
