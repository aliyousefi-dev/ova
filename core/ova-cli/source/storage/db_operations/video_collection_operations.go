package dboperations

import "ova-cli/source/datatypes"

type VideoSearchCriteria struct {
	Query       string
	Tags        []string
	MinRating   float64
	MaxDuration int64 // in seconds or milliseconds
	// Add other filters as needed
}

type VideoRepository interface {
	AddVideo(video datatypes.VideoData) error
	DeleteVideo(id string) error
	GetVideoByID(id string) (*datatypes.VideoData, error)
	UpdateVideo(video datatypes.VideoData) error
	SearchVideos(criteria VideoSearchCriteria) ([]datatypes.VideoData, error)
}
