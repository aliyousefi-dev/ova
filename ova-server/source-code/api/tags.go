package api

import (
	"net/http"
	"strings"

	"ova-server/source-code/storage"

	"github.com/gin-gonic/gin"
)

// TagUpdateRequest represents the payload to update tags for a video.
type TagUpdateRequest struct {
	Tags []string `json:"tags"`
}

// RegisterVideoTagRoutes registers routes to get or update video tags.
func RegisterVideoTagRoutes(rg *gin.RouterGroup, manager *storage.StorageManager) {
	videos := rg.Group("/videos/tags")
	{
		videos.GET("/:videoID", getVideoTags(manager))
		videos.POST("/:videoID", updateVideoTags(manager))
	}
}

// getVideoTags handles GET /videos/tags/:videoID
func getVideoTags(manager *storage.StorageManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoID := strings.TrimSpace(c.Param("videoID"))

		video, err := manager.Videos.FindVideo(videoID)
		if err != nil {
			respondError(c, http.StatusNotFound, "Video not found")
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{"tags": video.Tags}, "Tags retrieved successfully")
	}
}

// updateVideoTags handles POST /videos/tags/:videoID
func updateVideoTags(manager *storage.StorageManager) gin.HandlerFunc {
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

		video, err := manager.Videos.FindVideo(videoID)
		if err != nil {
			respondError(c, http.StatusNotFound, "Video not found")
			return
		}

		video.Tags = req.Tags

		if err := manager.Videos.UpdateVideo(*video); err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to update video tags")
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{"tags": video.Tags}, "Tags updated successfully")
	}
}
