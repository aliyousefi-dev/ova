package datatypes

// VideoMetadata holds technical details extracted from a video file.
// Adjusted 'Duration' type and 'MimeType' JSON tag for consistency.
type VideoMetadata struct {
	Duration   int             `json:"durationSeconds"` // Duration in seconds (consistent with VideoData)
	MimeType   Codecs          `json:"codecs"`          // Renamed json tag to 'codecs' for consistency with VideoData's field name, though `MimeType` struct name is fine.
	Resolution VideoResolution `json:"resolution"`      // Width and Height of the video
}
