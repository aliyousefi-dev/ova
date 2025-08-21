package api

import (
	"net/http"
	"ova-cli/source/internal/repo"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// RegisterFolderRoutes sets up the GET /folders route using RepoManager.
func RegisterSpaceContentRoutes(rg *gin.RouterGroup, repoMgr *repo.RepoManager) {
	spaces := rg.Group("/spaces")
	spaces.GET("", getVideosOnSpace(repoMgr)) // GET /api/v1/videos?folder=...
}

// getVideosOnSpace handles fetching video IDs from a space, with support for bucketed fetching.
func getVideosOnSpace(repoMgr *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		spaceQuery := c.Query("space")
		requestedPath := filepath.ToSlash(strings.Trim(spaceQuery, "/"))

		// Parse bucket from query parameters (default: 1)
		bucketStr := c.DefaultQuery("bucket", "1")
		bucket, err := strconv.Atoi(bucketStr)
		if err != nil || bucket <= 0 {
			respondError(c, http.StatusBadRequest, "Invalid bucket parameter")
			return
		}

		// Fixed bucket size
		bucketContentSize := 20

		// Get total number of videos in space
		totalVideos, err := repoMgr.GetVideoCountInSpace(requestedPath)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to get space video count")
			return
		}

		// If no videos found
		if totalVideos == 0 {
			respondSuccess(c, http.StatusOK, gin.H{
				"space":             requestedPath,
				"videoIds":          []string{},
				"totalVideos":       0,
				"currentBucket":     bucket,
				"bucketContentSize": bucketContentSize,
				"totalBuckets":      0,
			}, "No videos found in space")
			return
		}

		// Calculate start/end based on bucket
		start := (bucket - 1) * bucketContentSize
		end := start + bucketContentSize
		if end > totalVideos {
			end = totalVideos
		}

		// Fetch video IDs for the given bucket
		videoIDs, err := repoMgr.GetVideoIDsBySpaceInRange(requestedPath, start, end)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to retrieve space videos")
			return
		}

		// Response payload
		response := gin.H{
			"space":             requestedPath,
			"videoIds":          videoIDs,
			"totalVideos":       totalVideos,
			"currentBucket":     bucket,
			"bucketContentSize": bucketContentSize,
			"totalBuckets":      (totalVideos + bucketContentSize - 1) / bucketContentSize,
		}

		respondSuccess(c, http.StatusOK, response, "Videos in space retrieved successfully")
	}
}
