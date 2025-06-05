package api

import (
	"net/http"

	"ova-server/source-code/storage"
	"ova-server/source-code/storage/datatypes"
	"ova-server/source-code/utils"

	"github.com/gin-gonic/gin"
)

// RegisterUserPlaylistRoutes registers playlist routes under the user scope.
func RegisterUserPlaylistRoutes(rg *gin.RouterGroup, manager *storage.StorageManager) {
	users := rg.Group("/users")
	{
		users.GET("/:username/playlists", getUserPlaylists(manager))
		users.POST("/:username/playlists", createUserPlaylist(manager))
		users.GET("/:username/playlists/:slug", getUserPlaylistBySlug(manager))
		users.DELETE("/:username/playlists/:slug", deleteUserPlaylistBySlug(manager))
		users.POST("/:username/playlists/:slug/videos", addVideoToPlaylist(manager))
		users.DELETE("/:username/playlists/:slug/videos/:videoId", deleteVideoFromPlaylist(manager))

	}
}

// GET /users/:username/playlists
func getUserPlaylists(manager *storage.StorageManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")
		user, err := manager.Users.FindUser(username)
		if err != nil {
			respondError(c, http.StatusNotFound, "User not found")
			return
		}
		respondSuccess(c, http.StatusOK, gin.H{"username": username, "playlists": user.Playlists}, "Playlists retrieved")
	}
}

// POST /users/:username/playlists
func createUserPlaylist(manager *storage.StorageManager) gin.HandlerFunc {
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

		// Only proceed if user exists
		if _, err := manager.Users.FindUser(username); err != nil {
			respondError(c, http.StatusNotFound, "User not found")
			return
		}

		// Try to add the playlist
		if err := manager.Users.AddPlaylistToUser(username, newPl); err != nil {
			respondError(c, http.StatusConflict, err.Error())
			return
		}

		respondSuccess(c, http.StatusCreated, newPl, "Playlist added")
	}
}

// GET /users/:username/playlists/:slug
func getUserPlaylistBySlug(manager *storage.StorageManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")
		slug := c.Param("slug")

		pl, err := manager.Users.GetPlaylist(username, slug)
		if err != nil {
			respondError(c, http.StatusNotFound, "Playlist not found")
			return
		}

		respondSuccess(c, http.StatusOK, pl, "Playlist retrieved")
	}
}

// DELETE /users/:username/playlists/:slug
func deleteUserPlaylistBySlug(manager *storage.StorageManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")
		slug := c.Param("slug")

		err := manager.Users.RemovePlaylist(username, slug)
		if err != nil {
			respondError(c, http.StatusNotFound, "Playlist not found")
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{}, "Playlist deleted")
	}
}

// POST /users/:username/playlists/:slug/videos
// Request body: { "videoId": "some-video-id" }
func addVideoToPlaylist(manager *storage.StorageManager) gin.HandlerFunc {
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

		err := manager.Users.AddVideoToUserPlaylist(username, slug, body.VideoID)
		if err != nil {
			if err.Error() == "user not found" || err.Error() == "playlist not found" {
				respondError(c, http.StatusNotFound, err.Error())
				return
			}
			respondError(c, http.StatusInternalServerError, err.Error())
			return
		}

		pl, _ := manager.Users.GetPlaylist(username, slug) // retrieve updated playlist

		respondSuccess(c, http.StatusOK, pl, "Video added to playlist")
	}
}

// DELETE /users/:username/playlists/:slug/videos/:videoId
func deleteVideoFromPlaylist(manager *storage.StorageManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")
		slug := c.Param("slug")
		videoId := c.Param("videoId")

		err := manager.Users.RemoveVideoFromUserPlaylist(username, slug, videoId)
		if err != nil {
			switch err.Error() {
			case "user not found", "playlist not found", "video not found in playlist":
				respondError(c, http.StatusNotFound, err.Error())
			default:
				respondError(c, http.StatusInternalServerError, err.Error())
			}
			return
		}

		pl, err := manager.Users.GetPlaylist(username, slug)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to get updated playlist")
			return
		}

		respondSuccess(c, http.StatusOK, pl, "Video removed from playlist")
	}
}
