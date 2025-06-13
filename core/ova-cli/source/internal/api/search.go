package api

import (
	"net/http"
	"strings"

	"ova-cli/source/internal/datatypes"
	"ova-cli/source/internal/interfaces"

	"github.com/gin-gonic/gin"
)

// SearchRequest represents the POST body with the search query.
type SearchRequest struct {
	Query string `json:"query"`
}

// RegisterSearchRoutes adds the /search endpoint to the router group.
func RegisterSearchRoutes(rg *gin.RouterGroup, storage interfaces.StorageService) {
	rg.POST("/search", searchVideos(storage))
}

// searchVideos handles POST /search with JSON body containing a search query.
func searchVideos(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req SearchRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			respondError(c, http.StatusBadRequest, "Invalid JSON payload")
			return
		}

		query := strings.TrimSpace(req.Query)
		if query == "" {
			respondError(c, http.StatusBadRequest, "Query cannot be empty")
			return
		}

		criteria := datatypes.VideoSearchCriteria{
			Query: query,
			// You can add additional fields like Tags, MinRating, MaxDuration here if needed
		}

		results, err := storage.SearchVideos(criteria)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to search videos")
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{
			"query":   query,
			"results": results,
		}, "Search completed successfully")
	}
}
