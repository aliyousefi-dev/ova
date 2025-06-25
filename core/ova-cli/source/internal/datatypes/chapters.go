package datatypes

// VttChapter represents a single chapter in VTT format.
type VttChapter struct {
	StartTime float64 `json:"startTime"` // seconds
	Title     string  `json:"title"`
}
