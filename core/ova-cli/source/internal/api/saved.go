package api

import (
	"net/http"

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

		videos, err := repoManager.GetUserSavedVideos(username)
		if err != nil {
			if err.Error() == "user not found" {
				respondError(c, http.StatusNotFound, "User not found")
			} else {
				respondError(c, http.StatusInternalServerError, "Failed to retrieve saved videos: "+err.Error())
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
