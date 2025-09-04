package api

import (
	"fmt"
	"net/http"
	"ova-cli/source/internal/repo"
	"strconv"

	"github.com/gin-gonic/gin"
)

// RegisterUserWatchedRoutes adds watched video endpoints for users.
func RegisterUserWatchedRoutes(rg *gin.RouterGroup, repoMgr *repo.RepoManager) {
	users := rg.Group("/users/:username")
	{
		users.POST("/watched", addVideoToWatched(repoMgr))         // POST /api/v1/users/:username/watched
		users.GET("/watched", getUserWatchedVideos(repoMgr))       // GET  /api/v1/users/:username/watched
		users.DELETE("/watched", clearUserWatchedHistory(repoMgr)) // DELETE /api/v1/users/:username/watched
	}
}

func addVideoToWatched(r *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")

		var req struct {
			VideoID string `json:"videoId"`
		}
		if err := c.ShouldBindJSON(&req); err != nil || req.VideoID == "" {
			respondError(c, http.StatusBadRequest, "Invalid videoId in request")
			return
		}

		err := r.AddVideoToWatched(username, req.VideoID)
		if err != nil {
			respondError(c, http.StatusBadRequest, err.Error())
			return
		}

		respondSuccess(c, http.StatusOK, nil, "Video marked as watched")
	}
}

func getUserWatchedVideos(r *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the username from the URL parameter
		username := c.Param("username")

		// Parse the bucket from query parameters (default to 1 if not provided)
		bucketStr := c.DefaultQuery("bucket", "1")
		bucket, err := strconv.Atoi(bucketStr)
		if err != nil || bucket <= 0 {
			respondError(c, http.StatusBadRequest, "Invalid bucket parameter")
			return
		}

		// Hardcode the bucket size to 20 (or any other appropriate size)
		bucketContentSize := r.GetConfigs().MaxBucketSize

		// Get the count of watched videos for the user
		totalVideos, err := r.GetUserWatchedVideosCount(username)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to get watched video count")
			return
		}

		// If no videos are found, return an empty list
		if totalVideos == 0 {
			response := gin.H{
				"videoIds":          []string{}, // Return an empty videoIds array
				"totalVideos":       0,
				"currentBucket":     bucket,
				"bucketContentSize": bucketContentSize,
				"totalBuckets":      0, // No buckets if there are no videos
			}
			respondSuccess(c, http.StatusOK, response, "No watched videos found")
			return
		}

		// Calculate the start and end indices based on the bucket and bucket size
		start := (bucket - 1) * bucketContentSize
		end := start + bucketContentSize

		// Ensure the end index does not exceed the total number of videos
		if end > totalVideos {
			end = totalVideos
		}

		// Fetch the specific range of watched videos
		videosInRange, err := r.GetUserWatchedVideosInRange(username, start, end)
		if err != nil {
			respondError(c, http.StatusBadRequest, err.Error())
			return
		}

		// If no videos in the range, return an empty videoIds list
		if len(videosInRange) == 0 {
			videosInRange = []string{}
		}

		// Prepare the response with the videos in the current bucket, total count, and number of buckets
		response := gin.H{
			"videoIds":          videosInRange,
			"totalVideos":       totalVideos, // Add total video count to the response
			"currentBucket":     bucket,
			"bucketContentSize": bucketContentSize,
			"totalBuckets":      (totalVideos + bucketContentSize - 1) / bucketContentSize, // Calculate total number of buckets
		}

		respondSuccess(c, http.StatusOK, response, "Fetched watched videos")
	}
}

func clearUserWatchedHistory(r *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")

		err := r.ClearUserWatchedHistory(username)
		if err != nil {
			// A 404 Not Found is appropriate if the user doesn't exist
			if err.Error() == fmt.Sprintf("user %q not found", username) {
				respondError(c, http.StatusNotFound, err.Error())
			} else {
				respondError(c, http.StatusInternalServerError, "Failed to clear watched history: "+err.Error())
			}
			return
		}

		respondSuccess(c, http.StatusOK, nil, "User watched history cleared successfully")
	}
}
