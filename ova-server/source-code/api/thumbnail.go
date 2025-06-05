package api

import (
	"net/http"
	"os"

	"ova-server/source-code/storage"

	"github.com/gin-gonic/gin"
)

// RegisterThumbnailRoutes registers the thumbnail endpoint using the provided StorageManager.
func RegisterThumbnailRoutes(rg *gin.RouterGroup, manager *storage.StorageManager) {
	rg.GET("/thumbnail/:videoId", getThumbnail(manager))
}

// getThumbnail returns a handler function that serves a thumbnail image for a given video ID.
func getThumbnail(manager *storage.StorageManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")

		video, err := manager.Videos.FindVideo(videoId)
		if err != nil {
			respondError(c, http.StatusNotFound, "Video not found")
			return
		}

		if video.ThumbnailPath == nil || *video.ThumbnailPath == "" {
			respondError(c, http.StatusNotFound, "Thumbnail path not set")
			return
		}

		thumbnailPath := *video.ThumbnailPath

		if _, err := os.Stat(thumbnailPath); os.IsNotExist(err) {
			respondError(c, http.StatusNotFound, "Thumbnail not found")
			return
		} else if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to access thumbnail file")
			return
		}

		// Serve the thumbnail file
		c.File(thumbnailPath)
	}
}
