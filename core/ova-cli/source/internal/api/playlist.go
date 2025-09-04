package api

import (
	"net/http"
	"ova-cli/source/internal/datatypes"
	"ova-cli/source/internal/repo"
	"ova-cli/source/internal/utils"

	"github.com/gin-gonic/gin"
)

// RegisterUserPlaylistRoutes registers playlist routes under the user scope.
func RegisterUserPlaylistRoutes(rg *gin.RouterGroup, rm *repo.RepoManager) {
	users := rg.Group("/users")
	{
		users.GET("/:username/playlists", getUserPlaylists(rm))
		users.POST("/:username/playlists", createUserPlaylist(rm))
		users.DELETE("/:username/playlists/:slug", deleteUserPlaylistBySlug(rm))
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

		var headVideoId string

		if len(user.Playlists) > 0 && len(user.Playlists[0].VideoIDs) > 0 {
			headVideoId = user.Playlists[0].VideoIDs[0]
		} else {
			headVideoId = "" // or nil in JSON
		}

		// Process each playlist to add headVideoId and totalVideos
		playlists := []map[string]interface{}{}
		for _, playlist := range user.Playlists {
			playlists = append(playlists, map[string]interface{}{
				"title":       playlist.Title,
				"description": playlist.Description,
				"headVideoId": headVideoId,            // first video ID in the playlist
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
