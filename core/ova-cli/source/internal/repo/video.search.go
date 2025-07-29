package repo

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
)

// GetSimilarVideos returns videos similar to the one identified by videoID.
func (r *RepoManager) GetSimilarVideos(videoID string) ([]datatypes.VideoData, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.GetSimilarVideos(videoID)
}

// SearchVideos searches videos based on criteria.
func (r *RepoManager) SearchVideos(criteria datatypes.VideoSearchCriteria) ([]datatypes.VideoData, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.SearchVideos(criteria)
}

// GetSearchSuggestions fetches video titles based on a partial query.
func (r *RepoManager) GetSearchSuggestions(query string) ([]string, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}

	// Delegate the suggestion fetching to the appropriate data storage
	return r.diskDataStorage.GetSearchSuggestions(query)
}
