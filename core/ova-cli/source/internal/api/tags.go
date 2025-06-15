package api

import (
	"net/http"
	"strings"

	"ova-cli/source/internal/interfaces"

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
func RegisterVideoTagRoutes(rg *gin.RouterGroup, Storage interfaces.StorageService) {
	videos := rg.Group("/videos/tags")
	{
		videos.GET("/:videoID", getVideoTags(Storage))
		videos.POST("/:videoID/add", addVideoTag(Storage))
		videos.POST("/:videoID/remove", removeVideoTag(Storage))
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

// addVideoTag handles POST /videos/tags/:videoID/add
func addVideoTag(Storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoID := strings.TrimSpace(c.Param("videoID"))
		var req TagAddRequest

		if err := c.ShouldBindJSON(&req); err != nil || strings.TrimSpace(req.Tag) == "" {
			respondError(c, http.StatusBadRequest, "Invalid request payload")
			return
		}

		if err := Storage.AddTagToVideo(videoID, req.Tag); err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to add tag")
			return
		}

		// Optionally fetch updated video to get latest tags
		video, err := Storage.GetVideoByID(videoID)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to fetch updated video")
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{"tags": video.Tags}, "Tag added successfully")
	}
}

// removeVideoTag handles POST /videos/tags/:videoID/remove
func removeVideoTag(Storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoID := strings.TrimSpace(c.Param("videoID"))
		var req TagRemoveRequest

		if err := c.ShouldBindJSON(&req); err != nil || strings.TrimSpace(req.Tag) == "" {
			respondError(c, http.StatusBadRequest, "Invalid request payload")
			return
		}

		if err := Storage.RemoveTagFromVideo(videoID, req.Tag); err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to remove tag")
			return
		}

		// Optionally fetch updated video to get latest tags
		video, err := Storage.GetVideoByID(videoID)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to fetch updated video")
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{"tags": video.Tags}, "Tag removed successfully")
	}
}
