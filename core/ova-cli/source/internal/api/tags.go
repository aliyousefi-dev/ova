package api

import (
	"net/http"
	"strings"

	"ova-cli/source/internal/repo"

	"github.com/gin-gonic/gin"
)

// TagAddRequest represents the payload to add a single tag.
type TagAddRequest struct {
	Tag string `json:"tag"`
}

// TagRemoveRequest represents the payload to remove a single tag.
type TagRemoveRequest struct {
	Tag string `json:"tag"`
}

// RegisterVideoTagRoutes registers routes to get, add, or remove video tags.
func RegisterVideoTagRoutes(rg *gin.RouterGroup, repo *repo.RepoManager) {
	videos := rg.Group("/videos/tags")
	{
		videos.GET("/:videoID", getVideoTags(repo))
		videos.POST("/:videoID/add", addVideoTag(repo))
		videos.POST("/:videoID/remove", removeVideoTag(repo))
	}
}

// getVideoTags handles GET /videos/tags/:videoID
func getVideoTags(repo *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoID := strings.TrimSpace(c.Param("videoID"))

		video, err := repo.GetVideoByID(videoID)
		if err != nil {
			respondError(c, http.StatusNotFound, "Video not found")
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{"tags": video.Tags}, "Tags retrieved successfully")
	}
}

// addVideoTag handles POST /videos/tags/:videoID/add
func addVideoTag(repo *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoID := strings.TrimSpace(c.Param("videoID"))
		var req TagAddRequest

		if err := c.ShouldBindJSON(&req); err != nil || strings.TrimSpace(req.Tag) == "" {
			respondError(c, http.StatusBadRequest, "Invalid request payload")
			return
		}

		if err := repo.AddTagToVideo(videoID, req.Tag); err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to add tag")
			return
		}

		video, err := repo.GetVideoByID(videoID)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to fetch updated video")
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{"tags": video.Tags}, "Tag added successfully")
	}
}

// removeVideoTag handles POST /videos/tags/:videoID/remove
func removeVideoTag(repo *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoID := strings.TrimSpace(c.Param("videoID"))
		var req TagRemoveRequest

		if err := c.ShouldBindJSON(&req); err != nil || strings.TrimSpace(req.Tag) == "" {
			respondError(c, http.StatusBadRequest, "Invalid request payload")
			return
		}

		if err := repo.RemoveTagFromVideo(videoID, req.Tag); err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to remove tag")
			return
		}

		video, err := repo.GetVideoByID(videoID)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to fetch updated video")
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{"tags": video.Tags}, "Tag removed successfully")
	}
}
