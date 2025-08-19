package api

import (
	"net/http"
	"ova-cli/source/internal/repo"
	"strconv"

	"github.com/gin-gonic/gin"
)

// RegisterUserPlaylistRoutes registers playlist routes under the user scope.
func RegisterUserPlaylistContentRoutes(rg *gin.RouterGroup, rm *repo.RepoManager) {
	users := rg.Group("/users")
	{
		users.GET("/:username/playlists/:slug", getUserPlaylistContents(rm))
		users.POST("/:username/playlists/:slug/videos", addVideoToPlaylist(rm))
		users.DELETE("/:username/playlists/:slug/videos/:videoId", deleteVideoFromPlaylist(rm))
	}
}

// GET /users/:username/playlists/:slug/contents
func getUserPlaylistContents(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")
		slug := c.Param("slug")

		// Parse bucket from query parameters (default: 1)
		bucketStr := c.DefaultQuery("bucket", "1")
		bucket, err := strconv.Atoi(bucketStr)
		if err != nil || bucket <= 0 {
			respondError(c, http.StatusBadRequest, "Invalid bucket parameter")
			return
		}

		// Fixed bucket size
		bucketContentSize := 20

		// Get total number of videos in playlist
		totalVideos, err := rm.GetUserPlaylistContentVideosCount(username, slug)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to get playlist videos count")
			return
		}

		// If playlist is empty
		if totalVideos == 0 {
			respondSuccess(c, http.StatusOK, gin.H{
				"username":          username,
				"slug":              slug,
				"videoIds":          []string{},
				"totalVideos":       0,
				"currentBucket":     bucket,
				"bucketContentSize": bucketContentSize,
				"totalBuckets":      0,
			}, "No videos found in playlist")
			return
		}

		// Calculate start/end based on bucket
		start := (bucket - 1) * bucketContentSize
		end := start + bucketContentSize
		if end > totalVideos {
			end = totalVideos
		}

		// Fetch playlist videos for the given bucket
		videos, err := rm.GetUserPlaylistContentVideosInRange(username, slug, start, end)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to retrieve playlist videos")
			return
		}

		// Response payload
		response := gin.H{
			"username":          username,
			"slug":              slug,
			"videoIds":          videos,
			"totalVideos":       totalVideos,
			"currentBucket":     bucket,
			"bucketContentSize": bucketContentSize,
			"totalBuckets":      (totalVideos + bucketContentSize - 1) / bucketContentSize,
		}

		respondSuccess(c, http.StatusOK, response, "Playlist contents retrieved successfully")
	}
}

func addVideoToPlaylist(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")
		slug := c.Param("slug")

		var body struct {
			VideoID string `json:"videoId"`
		}
		if err := c.ShouldBindJSON(&body); err != nil || body.VideoID == "" {
			respondError(c, http.StatusBadRequest, "Invalid or missing videoId")
			return
		}

		err := rm.AddVideoToPlaylist(username, slug, body.VideoID)
		if err != nil {
			respondError(c, http.StatusInternalServerError, err.Error())
			return
		}

		pl, _ := rm.GetUserPlaylist(username, slug)
		respondSuccess(c, http.StatusOK, pl, "Video added to playlist")
	}
}

func deleteVideoFromPlaylist(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")
		slug := c.Param("slug")
		videoId := c.Param("videoId")

		err := rm.RemoveVideoFromPlaylist(username, slug, videoId)
		if err != nil {
			respondError(c, http.StatusInternalServerError, err.Error())
			return
		}

		pl, _ := rm.GetUserPlaylist(username, slug)
		respondSuccess(c, http.StatusOK, pl, "Video removed from playlist")
	}
}
