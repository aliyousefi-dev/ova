package api

import (
	"net/http"
	"ova-cli/source/internal/datatypes"
	"ova-cli/source/internal/repo"
	"ova-cli/source/internal/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

// RegisterUserPlaylistRoutes registers playlist routes under the user scope.
func RegisterUserPlaylistRoutes(rg *gin.RouterGroup, rm *repo.RepoManager) {
	users := rg.Group("/users")
	{
		users.GET("/:username/playlists", getUserPlaylists(rm))
		users.POST("/:username/playlists", createUserPlaylist(rm))
		users.GET("/:username/playlists/:slug", getUserPlaylistContents(rm))
		users.DELETE("/:username/playlists/:slug", deleteUserPlaylistBySlug(rm))
		users.POST("/:username/playlists/:slug/videos", addVideoToPlaylist(rm))
		users.DELETE("/:username/playlists/:slug/videos/:videoId", deleteVideoFromPlaylist(rm))
		users.PUT("/:username/playlists/order", setUserPlaylistsOrder(rm))
		users.PUT("/:username/playlists/:slug", updateUserPlaylistInfo(rm))
	}
}

func getUserPlaylists(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")
		user, err := rm.GetUserByUsername(username)
		if err != nil {
			respondError(c, http.StatusNotFound, "User not found")
			return
		}

		// Process each playlist to add headVideoId and totalVideos
		playlists := []map[string]interface{}{}
		for _, playlist := range user.Playlists {
			playlists = append(playlists, map[string]interface{}{
				"title":       playlist.Title,
				"description": playlist.Description,
				"headVideoId": playlist.VideoIDs[0],   // first video ID in the playlist
				"totalVideos": len(playlist.VideoIDs), // count of videos
				"slug":        playlist.Slug,
				"order":       playlist.Order,
			})
		}

		respondSuccess(c, http.StatusOK, gin.H{
			"username":       username,
			"playlists":      playlists,
			"totalPlaylists": len(playlists), // total number of playlists
		}, "Playlists retrieved")
	}
}

func createUserPlaylist(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")
		var newPl datatypes.PlaylistData

		if err := c.ShouldBindJSON(&newPl); err != nil {
			respondError(c, http.StatusBadRequest, "Invalid JSON: "+err.Error())
			return
		}
		if newPl.Title == "" {
			respondError(c, http.StatusBadRequest, "Title is required")
			return
		}

		newPl.Slug = utils.ToSlug(newPl.Title)

		if _, err := rm.GetUserByUsername(username); err != nil {
			respondError(c, http.StatusNotFound, "User not found")
			return
		}

		if err := rm.AddPlaylistToUser(username, &newPl); err != nil {
			respondError(c, http.StatusConflict, err.Error())
			return
		}

		respondSuccess(c, http.StatusCreated, newPl, "Playlist added")
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

func deleteUserPlaylistBySlug(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")
		slug := c.Param("slug")

		if err := rm.DeleteUserPlaylist(username, slug); err != nil {
			respondError(c, http.StatusNotFound, "Playlist not found")
			return
		}
		respondSuccess(c, http.StatusOK, gin.H{}, "Playlist deleted")
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

func setUserPlaylistsOrder(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")

		var body struct {
			Order []string `json:"order"`
		}
		if err := c.ShouldBindJSON(&body); err != nil || len(body.Order) == 0 {
			respondError(c, http.StatusBadRequest, "Invalid or missing order array")
			return
		}

		if err := rm.SetPlaylistsOrder(username, body.Order); err != nil {
			respondError(c, http.StatusInternalServerError, err.Error())
			return
		}
		respondSuccess(c, http.StatusOK, nil, "Playlist order updated")
	}
}

func updateUserPlaylistInfo(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")
		slug := c.Param("slug")

		var body struct {
			Title       string `json:"title"`
			Description string `json:"description"`
		}
		if err := c.ShouldBindJSON(&body); err != nil {
			respondError(c, http.StatusBadRequest, "Invalid JSON: "+err.Error())
			return
		}

		if body.Title == "" && body.Description == "" {
			respondError(c, http.StatusBadRequest, "At least one of title or description must be provided")
			return
		}

		err := rm.UpdatePlaylistInfo(username, slug, body.Title, body.Description)
		if err != nil {
			respondError(c, http.StatusInternalServerError, err.Error())
			return
		}

		pl, err := rm.GetUserPlaylist(username, slug)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to retrieve updated playlist")
			return
		}

		respondSuccess(c, http.StatusOK, pl, "Playlist info updated")
	}
}
