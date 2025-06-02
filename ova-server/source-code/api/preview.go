package api

import (
	"net/http"
	"os"
	"ova-server/source-code/storage"

	"github.com/gin-gonic/gin"
)

// RegisterPreviewRoutes registers the preview endpoint using the provided StorageManager.
func RegisterPreviewRoutes(rg *gin.RouterGroup, manager *storage.StorageManager, sm *SessionManager) {
	rg.GET("/preview/:videoId", getPreview(manager), sm.AuthRequired())
}

// getPreview returns a handler function that serves a preview video file for a given video ID.
func getPreview(manager *storage.StorageManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")

		video, err := manager.Videos.FindVideo(videoId)
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
