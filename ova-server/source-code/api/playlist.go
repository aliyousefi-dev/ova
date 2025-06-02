package api

import (
	"net/http"
	"ova-server/source-code/storage"
	"ova-server/source-code/storage/datamodels"
	"ova-server/source-code/utils"

	"github.com/gin-gonic/gin"
)

// RegisterPlaylistsRoutes adds playlist-related endpoints to the router group using the provided managers.
func RegisterPlaylistsRoutes(rg *gin.RouterGroup, manager *storage.StorageManager, sm *SessionManager) {
	playlistsGroup := rg.Group("/playlists", sm.AuthRequired())
	{
		playlistsGroup.GET("", getPlaylists(manager))
		playlistsGroup.POST("", createPlaylist(manager))

		playlistsGroup.GET("/:slug", getPlaylistBySlug(manager))
		playlistsGroup.DELETE("/:slug", deletePlaylistBySlug(manager))

	}
}

// GET /playlists — return all playlists
func getPlaylists(manager *storage.StorageManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		playlistsMap, err := manager.Playlists.LoadPlaylists()
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to load playlists")
			return
		}

		respondSuccess(c, http.StatusOK, playlistsMap, "Playlists retrieved")
	}
}

// POST /playlists — create a new playlist
func createPlaylist(manager *storage.StorageManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		var newPl datamodels.PlaylistData
		if err := c.ShouldBindJSON(&newPl); err != nil {
			respondError(c, http.StatusBadRequest, "Invalid JSON: "+err.Error())
			return
		}
		if newPl.Title == "" {
			respondError(c, http.StatusBadRequest, "Title is required")
			return
		}

		slug := utils.ToSlug(newPl.Title) // generate slug
		newPl.Slug = slug                 // assign slug here

		err := manager.Playlists.AddPlaylist(newPl)
		if err != nil {
			respondError(c, http.StatusConflict, err.Error())
			return
		}

		respondSuccess(c, http.StatusCreated, newPl, "Playlist created")
	}
}

// GET /playlists/:slug — get single playlist by slug
func getPlaylistBySlug(manager *storage.StorageManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		slug := c.Param("slug") // use slug here
		pl, err := manager.Playlists.FindPlaylistBySlug(slug)
		if err != nil {
			respondError(c, http.StatusNotFound, "Playlist not found")
			return
		}

		pl.Slug = slug // add slug field before returning

		respondSuccess(c, http.StatusOK, pl, "Playlist retrieved")
	}
}

// DELETE /playlists/:slug — delete playlist by slug
func deletePlaylistBySlug(manager *storage.StorageManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		slug := c.Param("slug") // use slug here
		err := manager.Playlists.RemovePlaylist(slug)
		if err != nil {
			respondError(c, http.StatusNotFound, "Playlist not found or could not be deleted")
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{}, "Playlist deleted")
	}
}
