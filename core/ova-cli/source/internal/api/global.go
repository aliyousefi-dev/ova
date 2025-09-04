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
		// GET /api/v1/videos/latest?bucket=1
		videos.GET("/global", getLatestVideos(repoMgr))
	}
}

// getLatestVideos retrieves the latest video IDs based on the bucket provided in query params.
func getLatestVideos(repoMgr *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Parse bucket from query parameters (default to 1 if not provided)
		bucketStr := c.DefaultQuery("bucket", "1")

		// Convert bucket to integer
		bucket, err := strconv.Atoi(bucketStr)
		if err != nil || bucket <= 0 {
			respondError(c, http.StatusBadRequest, "Invalid bucket parameter")
			return
		}

		// Hardcode the bucket size to 20
		bucketContentSize := repoMgr.GetConfigs().MaxBucketSize

		// Call GetTotalVideosCached to get the total count of cached videos
		totalVideos, err := repoMgr.GetTotalVideosCached()
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to get total video count")
			return
		}

		// Calculate the start and end indices based on bucket and hardcoded bucket_size (20)
		start := (bucket - 1) * bucketContentSize
		end := start + bucketContentSize

		// Ensure the end index does not exceed the total number of videos
		if end > totalVideos {
			end = totalVideos
		}

		// Fetch video IDs in the calculated range from memory storage
		videoIDsInRange, err := repoMgr.GetSortedVideosByRange(start, end)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to retrieve videos")
			return
		}

		// Prepare the response with video IDs and total video count
		response := gin.H{
			"videoIds":          videoIDsInRange,
			"totalVideos":       totalVideos, // Add total video count to the response
			"currentBucket":     bucket,
			"bucketContentSize": bucketContentSize,
			"totalBuckets":      (totalVideos + bucketContentSize - 1) / bucketContentSize, // Calculate total number of buckets
		}

		respondSuccess(c, http.StatusOK, response, "Latest videos retrieved successfully")
	}
}
