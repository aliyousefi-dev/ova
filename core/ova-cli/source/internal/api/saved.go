package api

import (
	"net/http"

	"ova-cli/source/internal/interfaces"

	"github.com/gin-gonic/gin"
)

func RegisterUserSavedRoutes(rg *gin.RouterGroup, storage interfaces.StorageService) {
	users := rg.Group("/users")
	{
		users.GET("/:username/saved", getUserSaved(storage))
		users.POST("/:username/saved/:videoId", addUserSaved(storage))
		users.DELETE("/:username/saved/:videoId", removeUserSaved(storage))
	}
}

// GET /users/:username/saved
func getUserSaved(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")

		videos, err := storage.GetUserSavedVideos(username) // storage method name can remain or be renamed later
		if err != nil {
			if err.Error() == "user not found" {
				respondError(c, http.StatusNotFound, "User not found")
			} else {
				respondError(c, http.StatusInternalServerError, "Failed to retrieve saved videos")
			}
			return
		}

		savedIDs := make([]string, 0, len(videos))
		for _, video := range videos {
			savedIDs = append(savedIDs, video.VideoID)
		}

		respondSuccess(c, http.StatusOK, gin.H{
			"username": username,
			"saved":    savedIDs,
		}, "Saved videos retrieved")
	}
}

// POST /users/:username/saved/:videoId
func addUserSaved(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")
		videoID := c.Param("videoId")

		_, err := storage.GetVideoByID(videoID)
		if err != nil {
			respondError(c, http.StatusNotFound, "Video not found")
			return
		}

		err = storage.AddVideoToSaved(username, videoID) // rename storage method later if needed
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to add saved video")
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{
			"username": username,
			"videoId":  videoID,
		}, "Video added to saved")
	}
}

// DELETE /users/:username/saved/:videoId
func removeUserSaved(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")
		videoID := c.Param("videoId")

		err := storage.RemoveVideoFromSaved(username, videoID) // rename storage method later if needed
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to remove saved video")
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{
			"username": username,
			"videoId":  videoID,
		}, "Video removed from saved")
	}
}
