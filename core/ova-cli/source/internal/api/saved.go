package api

import (
	"net/http"
	"strconv"

	"ova-cli/source/internal/repo"

	"github.com/gin-gonic/gin"
)

func RegisterUserSavedRoutes(rg *gin.RouterGroup, repoManager *repo.RepoManager) {
	users := rg.Group("/users")
	{
		users.GET("/:username/saved", getUserSaved(repoManager))
		users.POST("/:username/saved/:videoId", addUserSaved(repoManager))
		users.DELETE("/:username/saved/:videoId", removeUserSaved(repoManager))
	}
}

// GET /users/:username/saved
func getUserSaved(repoManager *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")

		// Parse bucket from query parameters (default to 1 if not provided)
		bucketStr := c.DefaultQuery("bucket", "1")

		// Convert bucket to integer
		bucket, err := strconv.Atoi(bucketStr)
		if err != nil || bucket <= 0 {
			respondError(c, http.StatusBadRequest, "Invalid bucket parameter")
			return
		}

		// Hardcode the bucket size to 20
		bucketContentSize := repoManager.GetConfigs().MaxBucketSize

		// Call GetUserSavedVideos to get the total count of saved videos for the user
		totalVideos, err := repoManager.GetUserSavedVideosCount(username)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to get saved videos count")
			return
		}

		// If there are no saved videos, return an empty response
		if totalVideos == 0 {
			respondSuccess(c, http.StatusOK, gin.H{
				"username":          username,
				"videoIds":          []string{}, // Empty array for saved videos
				"totalVideos":       0,
				"currentBucket":     bucket,
				"bucketContentSize": bucketContentSize,
				"totalBuckets":      0, // No buckets if no videos
			}, "No saved videos found")
			return
		}

		// Calculate the start and end indices based on bucket and hardcoded bucket_size (20)
		start := (bucket - 1) * bucketContentSize
		end := start + bucketContentSize

		// Ensure the end index does not exceed the total number of saved videos
		if end > totalVideos {
			end = totalVideos
		}

		// Fetch saved video IDs in the calculated range from memory storage
		savedVideos, err := repoManager.GetUserSavedVideosInRange(username, start, end)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to retrieve saved videos in range")
			return
		}

		// Prepare the response with saved video IDs, total video count, and bucket details
		response := gin.H{
			"username":          username,
			"videoIds":          savedVideos,
			"totalVideos":       totalVideos,
			"currentBucket":     bucket,
			"bucketContentSize": bucketContentSize,
			"totalBuckets":      (totalVideos + bucketContentSize - 1) / bucketContentSize, // Calculate total number of buckets
		}

		respondSuccess(c, http.StatusOK, response, "Saved videos retrieved successfully")
	}
}

// POST /users/:username/saved/:videoId
func addUserSaved(repoManager *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")
		videoID := c.Param("videoId")

		// Check video existence via RepoManager
		if _, err := repoManager.GetVideoByID(videoID); err != nil {
			respondError(c, http.StatusNotFound, "Video not found")
			return
		}

		if err := repoManager.AddVideoToSaved(username, videoID); err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to add saved video: "+err.Error())
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{
			"username": username,
			"videoId":  videoID,
		}, "Video added to saved")
	}
}

// DELETE /users/:username/saved/:videoId
func removeUserSaved(repoManager *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")
		videoID := c.Param("videoId")

		if err := repoManager.RemoveVideoFromSaved(username, videoID); err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to remove saved video: "+err.Error())
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{
			"username": username,
			"videoId":  videoID,
		}, "Video removed from saved")
	}
}
