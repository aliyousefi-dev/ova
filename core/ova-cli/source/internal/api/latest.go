// latest.go
package api

import (
	"net/http"
	"ova-cli/source/internal/repo"
	"strconv"

	"github.com/gin-gonic/gin"
)

// RegisterLatestVideoRoute adds the latest video-related endpoint.
func RegisterLatestVideoRoute(rg *gin.RouterGroup, repoMgr *repo.RepoManager) {
	videos := rg.Group("/videos")
	{
		// GET /api/v1/videos/latest?start=0&end=10
		videos.GET("/latest", getLatestVideos(repoMgr))
	}
}

// getLatestVideos retrieves the latest video IDs based on the range provided in query params.
func getLatestVideos(repoMgr *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Parse start and end from query parameters
		startStr := c.DefaultQuery("start", "0") // Default to 0 if not provided
		endStr := c.DefaultQuery("end", "10")   // Default to 10 if not provided

		// Convert start and end to integers
		start, err := strconv.Atoi(startStr)
		if err != nil {
			respondError(c, http.StatusBadRequest, "Invalid start parameter")
			return
		}

		// Call GetTotalVideosCached to get the total count of cached videos
		totalVideos, err := repoMgr.GetTotalVideosCached()
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to get total video count")
			return
		}

		end, err := strconv.Atoi(endStr)
		if err != nil {
			respondError(c, http.StatusBadRequest, "Invalid end parameter")
			return
		}

		// Fetch video IDs in the specified range from memory storage
		videoIDsInRange, err := repoMgr.GetSortedVideosByRange(start, end)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to retrieve videos")
			return
		}

		// Prepare the response with video IDs and total video count
		response := gin.H{
			"videoIds":    videoIDsInRange,
			"totalVideos": totalVideos,  // Add total video count to the response
		}

		respondSuccess(c, http.StatusOK, response, "Latest videos retrieved successfully")
	}
}
