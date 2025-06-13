package api

import (
	"net/http"
	"strings"

	"ova-cli/source/internal/interfaces"

	"github.com/gin-gonic/gin"
)

// TagUpdateRequest represents the payload to update tags for a video.
type TagUpdateRequest struct {
	Tags []string `json:"tags"`
}

// RegisterVideoTagRoutes registers routes to get or update video tags.
func RegisterVideoTagRoutes(rg *gin.RouterGroup, storage interfaces.StorageService) {
	videos := rg.Group("/videos/tags")
	{
		videos.GET("/:videoID", getVideoTags(storage))
		videos.POST("/:videoID", updateVideoTags(storage))
	}
}

// getVideoTags handles GET /videos/tags/:videoID
func getVideoTags(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoID := strings.TrimSpace(c.Param("videoID"))

		video, err := storage.GetVideoByID(videoID)
		if err != nil {
			respondError(c, http.StatusNotFound, "Video not found")
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{"tags": video.Tags}, "Tags retrieved successfully")
	}
}

// updateVideoTags handles POST /videos/tags/:videoID
func updateVideoTags(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoID := strings.TrimSpace(c.Param("videoID"))
		var req TagUpdateRequest

		if err := c.ShouldBindJSON(&req); err != nil {
			respondError(c, http.StatusBadRequest, "Invalid request payload")
			return
		}

		if len(req.Tags) == 0 {
			respondError(c, http.StatusBadRequest, "Tags list cannot be empty")
			return
		}

		video, err := storage.GetVideoByID(videoID)
		if err != nil {
			respondError(c, http.StatusNotFound, "Video not found")
			return
		}

		video.Tags = req.Tags

		if err := storage.UpdateVideo(*video); err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to update video tags")
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{"tags": video.Tags}, "Tags updated successfully")
	}
}
