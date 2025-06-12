package datatypes

type VideoMetadata struct {
	Duration   float64         `json:"duration"`   // in seconds
	MimeType   Codecs          `json:"mimeType"`   // e.g. video/mp4; codecs="avc1.42E01E, mp4a.40.2"
	Resolution VideoResolution `json:"resolution"` // Width and Height
}
