package api

import (
	"net/http"
	"os"
	"ova-cli/source/internal/interfaces"

	"github.com/gin-gonic/gin"
)

// RegisterPreviewRoutes registers the preview endpoint using the provided Storagestorage.
func RegisterPreviewRoutes(rg *gin.RouterGroup, storage interfaces.StorageService) {
	rg.GET("/preview/:videoId", getPreview(storage))
}

// getPreview returns a handler function that serves a preview video file for a given video ID.
func getPreview(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")

		video, err := storage.GetVideoByID(videoId)
		if err != nil {
			respondError(c, http.StatusNotFound, "Video not found")
			return
		}

		if video.PreviewPath == nil || *video.PreviewPath == "" {
			respondError(c, http.StatusNotFound, "Preview path not set")
			return
		}

		previewPath := *video.PreviewPath

		if _, err := os.Stat(previewPath); os.IsNotExist(err) {
			respondError(c, http.StatusNotFound, "Preview not found")
			return
		} else if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to access preview file")
			return
		}

		// Serve the preview file
		c.File(previewPath)
	}
}
