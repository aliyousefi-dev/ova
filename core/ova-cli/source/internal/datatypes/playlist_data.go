package datatypes

import "ova-cli/source/internal/utils"

// PlaylistData represents a single playlist.
type PlaylistData struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	VideoIDs    []string `json:"videoIds"`
	Slug        string   `json:"slug"`
}

// NewPlaylistData returns an example playlist map.
func NewPlaylistData(title string) PlaylistData {
	return PlaylistData{
		Title:       title,
		Description: "A new sample playlist",
		VideoIDs:    []string{},
		Slug:        utils.ToSlug(title),
	}
}
