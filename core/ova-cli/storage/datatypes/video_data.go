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
	Width         int       `json:"width"`  // New field
	Height        int       `json:"height"` // New field
	UploadedAt    time.Time `json:"uploadedAt"`
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
	}
}
