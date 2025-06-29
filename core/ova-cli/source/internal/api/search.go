package api

import (
	"net/http"
	"strings"

	"ova-cli/source/internal/datatypes"
	"ova-cli/source/internal/repo"

	"github.com/gin-gonic/gin"
)

// SearchRequest represents the structure of the incoming search request.
type SearchRequest struct {
	Query       string   `json:"query"`
	Tags        []string `json:"tags"`
	MinRating   float64  `json:"minRating"`
	MaxDuration int      `json:"maxDuration"`
}

// RegisterSearchRoutes adds the /search endpoint to the router group.
func RegisterSearchRoutes(rg *gin.RouterGroup, repoManager *repo.RepoManager) {
	rg.POST("/search", searchVideos(repoManager))
}

// searchVideos handles POST /search with a JSON body containing search criteria.
func searchVideos(repoManager *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req SearchRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			respondError(c, http.StatusBadRequest, "Invalid JSON payload")
			return
		}

		criteria := datatypes.VideoSearchCriteria{
			Query:       strings.TrimSpace(req.Query),
			Tags:        req.Tags,
			MinRating:   req.MinRating,
			MaxDuration: req.MaxDuration,
		}

		// Validate that at least one filter is provided
		if criteria.Query == "" && len(criteria.Tags) == 0 && criteria.MinRating == 0 && criteria.MaxDuration == 0 {
			respondError(c, http.StatusBadRequest, "At least one search criteria must be provided (query, tags, minRating, or maxDuration)")
			return
		}

		results, err := repoManager.SearchVideos(criteria)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to search videos")
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{
			"query":      req.Query,
			"tags":       req.Tags,
			"results":    results,
			"totalCount": len(results),
		}, "Search completed successfully")
	}
}
