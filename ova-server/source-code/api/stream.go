package api

import (
	"net/http"
	"os"

	"ova-server/source-code/storage"

	"github.com/gin-gonic/gin"
)

// RegisterStreamRoutes registers the streaming endpoint using the provided StorageManager.
func RegisterStreamRoutes(rg *gin.RouterGroup, manager *storage.StorageManager) {
	rg.GET("/stream/:videoId", streamVideo(manager))
}

// streamVideo returns a handler function that streams a video file by its ID.
func streamVideo(manager *storage.StorageManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")

		video, err := manager.Videos.FindVideo(videoId)
		if err != nil {
			respondError(c, http.StatusNotFound, "Video not found")
			return
		}

		videoPath := video.FilePath
		if _, err := os.Stat(videoPath); os.IsNotExist(err) {
			respondError(c, http.StatusNotFound, "Video file not found on disk")
			return
		} else if err != nil {
			respondError(c, http.StatusInternalServerError, "Error accessing video file")
			return
		}

		// Stream the video file; Gin handles Range headers (for seeking)
		c.File(videoPath)
	}
}
