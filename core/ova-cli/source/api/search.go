package api

import (
	"net/http"
	"strings"

	"ova-cli/source/storage"

	"github.com/gin-gonic/gin"
)

// SearchRequest represents the POST body with the search query.
type SearchRequest struct {
	Query string `json:"query"`
}

// RegisterSearchRoutes adds the /search endpoint to the router group.
func RegisterSearchRoutes(rg *gin.RouterGroup, manager *storage.StorageManager) {
	rg.POST("/search", searchVideos(manager))
}

// searchVideos handles POST /search with JSON body containing a search query.
func searchVideos(manager *storage.StorageManager) gin.HandlerFunc {
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

		results, err := manager.Videos.SearchVideos(query)
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
