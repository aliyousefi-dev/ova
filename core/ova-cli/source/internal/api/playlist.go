package api

import (
	"net/http"

	"ova-cli/source/internal/datatypes"
	"ova-cli/source/internal/interfaces"
	"ova-cli/source/internal/utils"

	"github.com/gin-gonic/gin"
)

// RegisterUserPlaylistRoutes registers playlist routes under the user scope.
func RegisterUserPlaylistRoutes(rg *gin.RouterGroup, storage interfaces.StorageService) {
	users := rg.Group("/users")
	{
		users.GET("/:username/playlists", getUserPlaylists(storage))
		users.POST("/:username/playlists", createUserPlaylist(storage))
		users.GET("/:username/playlists/:slug", getUserPlaylistBySlug(storage))
		users.DELETE("/:username/playlists/:slug", deleteUserPlaylistBySlug(storage))
		users.POST("/:username/playlists/:slug/videos", addVideoToPlaylist(storage))
		users.DELETE("/:username/playlists/:slug/videos/:videoId", deleteVideoFromPlaylist(storage))

	}
}

// GET /users/:username/playlists
func getUserPlaylists(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")
		user, err := storage.GetUserByUsername(username)
		if err != nil {
			respondError(c, http.StatusNotFound, "User not found")
			return
		}
		respondSuccess(c, http.StatusOK, gin.H{"username": username, "playlists": user.Playlists}, "Playlists retrieved")
	}
}

// POST /users/:username/playlists
func createUserPlaylist(storage interfaces.StorageService) gin.HandlerFunc {
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
		if _, err := storage.GetUserByUsername(username); err != nil {
			respondError(c, http.StatusNotFound, "User not found")
			return
		}

		// Try to add the playlist
		if err := storage.AddPlaylistToUser(username, &newPl); err != nil {
			respondError(c, http.StatusConflict, err.Error())
			return
		}

		respondSuccess(c, http.StatusCreated, newPl, "Playlist added")
	}
}

// GET /users/:username/playlists/:slug
func getUserPlaylistBySlug(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")
		slug := c.Param("slug")

		pl, err := storage.GetUserPlaylist(username, slug)
		if err != nil {
			respondError(c, http.StatusNotFound, "Playlist not found")
			return
		}

		respondSuccess(c, http.StatusOK, pl, "Playlist retrieved")
	}
}

// DELETE /users/:username/playlists/:slug
func deleteUserPlaylistBySlug(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")
		slug := c.Param("slug")

		err := storage.DeleteUserPlaylist(username, slug)
		if err != nil {
			respondError(c, http.StatusNotFound, "Playlist not found")
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{}, "Playlist deleted")
	}
}

// POST /users/:username/playlists/:slug/videos
// Request body: { "videoId": "some-video-id" }
func addVideoToPlaylist(storage interfaces.StorageService) gin.HandlerFunc {
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

		err := storage.AddVideoToPlaylist(username, slug, body.VideoID)
		if err != nil {
			if err.Error() == "user not found" || err.Error() == "playlist not found" {
				respondError(c, http.StatusNotFound, err.Error())
				return
			}
			respondError(c, http.StatusInternalServerError, err.Error())
			return
		}

		pl, _ := storage.GetUserPlaylist(username, slug) // retrieve updated playlist

		respondSuccess(c, http.StatusOK, pl, "Video added to playlist")
	}
}

// DELETE /users/:username/playlists/:slug/videos/:videoId
func deleteVideoFromPlaylist(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")
		slug := c.Param("slug")
		videoId := c.Param("videoId")

		err := storage.RemoveVideoFromPlaylist(username, slug, videoId)
		if err != nil {
			switch err.Error() {
			case "user not found", "playlist not found", "video not found in playlist":
				respondError(c, http.StatusNotFound, err.Error())
			default:
				respondError(c, http.StatusInternalServerError, err.Error())
			}
			return
		}

		pl, err := storage.GetUserPlaylist(username, slug)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to get updated playlist")
			return
		}

		respondSuccess(c, http.StatusOK, pl, "Video removed from playlist")
	}
}
