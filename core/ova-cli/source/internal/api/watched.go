package api

import (
	"fmt"
	"net/http"
	"ova-cli/source/internal/interfaces" // Assuming this path is correct

	"github.com/gin-gonic/gin"
)

// RegisterUserWatchedRoutes adds watched video endpoints for users.
func RegisterUserWatchedRoutes(rg *gin.RouterGroup, storage interfaces.StorageService) {
	users := rg.Group("/users/:username")
	{
		users.POST("/watched", addVideoToWatched(storage))         // POST /api/v1/users/:username/watched
		users.GET("/watched", getUserWatchedVideos(storage))       // GET  /api/v1/users/:username/watched
		users.DELETE("/watched", clearUserWatchedHistory(storage)) // DELETE /api/v1/users/:username/watched
	}
}

func addVideoToWatched(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")

		var req struct {
			VideoID string `json:"videoId"`
		}
		if err := c.ShouldBindJSON(&req); err != nil || req.VideoID == "" {
			respondError(c, http.StatusBadRequest, "Invalid videoId in request")
			return
		}

		err := storage.AddVideoToWatched(username, req.VideoID)
		if err != nil {
			respondError(c, http.StatusBadRequest, err.Error())
			return
		}

		respondSuccess(c, http.StatusOK, nil, "Video marked as watched")
	}
}

func getUserWatchedVideos(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")

		videos, err := storage.GetUserWatchedVideos(username)
		if err != nil {
			respondError(c, http.StatusBadRequest, err.Error())
			return
		}

		respondSuccess(c, http.StatusOK, videos, "Fetched watched videos")
	}
}

// clearUserWatchedHistory handles the DELETE request to clear a user's watched history.
func clearUserWatchedHistory(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")

		err := storage.ClearUserWatchedHistory(username)
		if err != nil {
			// A 404 Not Found is appropriate if the user doesn't exist
			if err.Error() == fmt.Sprintf("user %q not found", username) { // Assuming storage returns this specific error message
				respondError(c, http.StatusNotFound, err.Error())
			} else {
				respondError(c, http.StatusInternalServerError, "Failed to clear watched history: "+err.Error())
			}
			return
		}

		respondSuccess(c, http.StatusOK, nil, "User watched history cleared successfully")
	}
}
