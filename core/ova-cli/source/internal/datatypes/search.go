package datatypes

// VideoSearchCriteria defines parameters for searching videos.
// Added JSON tags for consistency, especially if this struct is used in API requests.
type VideoSearchCriteria struct {
	Query       string   `json:"query,omitempty"`
	Tags        []string `json:"tags,omitempty"`
	MinRating   float64  `json:"minRating,omitempty"`
	MaxDuration int      `json:"maxDuration,omitempty"` // Duration in seconds
}
