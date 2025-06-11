package datatypes

import "ova-cli/source/utils"

// PlaylistData represents a single playlist.
type PlaylistData struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	VideoIDs    []string `json:"videoIds"`
	Slug        string   `json:"slug"`
}

// GeneratePlaylistJSON returns an example playlist map.
func GeneratePlaylistJSON(title string) PlaylistData {
	return PlaylistData{
		Title:       title,
		Description: "A new sample playlist",
		VideoIDs:    []string{},
		Slug:        utils.ToSlug(title),
	}
}
