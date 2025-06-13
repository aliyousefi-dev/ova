package api

import (
	"net/http"

	"ova-cli/source/internal/interfaces"

	"github.com/gin-gonic/gin"
)

func RegisterUserFavoritesRoutes(rg *gin.RouterGroup, storage interfaces.StorageService) {
	users := rg.Group("/users")
	{
		users.GET("/:username/favorites", getUserFavorites(storage))
		users.POST("/:username/favorites/:videoId", addUserFavorite(storage))
		users.DELETE("/:username/favorites/:videoId", removeUserFavorite(storage))
	}
}

// GET /users/:username/favorites
func getUserFavorites(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")

		favorites, err := storage.GetUserFavoriteVideos(username)
		if err != nil {
			if err.Error() == "user not found" {
				respondError(c, http.StatusNotFound, "User not found")
			} else {
				respondError(c, http.StatusInternalServerError, "Failed to retrieve favorite videos")
			}
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{
			"username":  username,
			"favorites": favorites,
		}, "Favorites retrieved")
	}
}

// POST /users/:username/favorites/:videoId
func addUserFavorite(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")
		videoID := c.Param("videoId")

		_, err := storage.GetVideoByID(videoID)
		if err != nil {
			respondError(c, http.StatusNotFound, "Video not found")
			return
		}

		err = storage.AddVideoToFavorites(username, videoID)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to add favorite")
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{
			"username": username,
			"videoId":  videoID,
		}, "Video added to favorites")
	}
}

// DELETE /users/:username/favorites/:videoId
func removeUserFavorite(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")
		videoID := c.Param("videoId")

		err := storage.RemoveVideoFromFavorites(username, videoID)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to remove favorite")
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{
			"username": username,
			"videoId":  videoID,
		}, "Video removed from favorites")
	}
}
