package api

import (
	"fmt"
	"net/http"
	"ova-cli/source/internal/repo"

	"github.com/gin-gonic/gin"
)

// RegisterUserWatchedRoutes adds watched video endpoints for users.
func RegisterUserWatchedRoutes(rg *gin.RouterGroup, repoMgr *repo.RepoManager) {
	users := rg.Group("/users/:username")
	{
		users.POST("/watched", addVideoToWatched(repoMgr))         // POST /api/v1/users/:username/watched
		users.GET("/watched", getUserWatchedVideos(repoMgr))       // GET  /api/v1/users/:username/watched
		users.DELETE("/watched", clearUserWatchedHistory(repoMgr)) // DELETE /api/v1/users/:username/watched
	}
}

func addVideoToWatched(r *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")

		var req struct {
			VideoID string `json:"videoId"`
		}
		if err := c.ShouldBindJSON(&req); err != nil || req.VideoID == "" {
			respondError(c, http.StatusBadRequest, "Invalid videoId in request")
			return
		}

		err := r.AddVideoToWatched(username, req.VideoID)
		if err != nil {
			respondError(c, http.StatusBadRequest, err.Error())
			return
		}

		respondSuccess(c, http.StatusOK, nil, "Video marked as watched")
	}
}

func getUserWatchedVideos(r *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")

		videos, err := r.GetUserWatchedVideos(username)
		if err != nil {
			respondError(c, http.StatusBadRequest, err.Error())
			return
		}

		respondSuccess(c, http.StatusOK, videos, "Fetched watched videos")
	}
}

func clearUserWatchedHistory(r *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")

		err := r.ClearUserWatchedHistory(username)
		if err != nil {
			// A 404 Not Found is appropriate if the user doesn't exist
			if err.Error() == fmt.Sprintf("user %q not found", username) {
				respondError(c, http.StatusNotFound, err.Error())
			} else {
				respondError(c, http.StatusInternalServerError, "Failed to clear watched history: "+err.Error())
			}
			return
		}

		respondSuccess(c, http.StatusOK, nil, "User watched history cleared successfully")
	}
}
