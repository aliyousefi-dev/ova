package api

import (
	"fmt"
	"net/http"
	"os"

	"ova-cli/source/internal/interfaces"

	"github.com/gin-gonic/gin"
)

// RegisterStreamRoutes registers the streaming endpoint using the provided Storagestorage.
func RegisterStreamRoutes(rg *gin.RouterGroup, storage interfaces.StorageService) {
	rg.GET("/stream/:videoId", streamVideo(storage))
	rg.HEAD("/stream/:videoId", streamVideo(storage)) // vidstack need this for load the video
}

// streamVideo returns a handler function that streams a video file by its ID.
func streamVideo(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")

		video, err := storage.GetVideoByID(videoId)
		if err != nil {
			respondError(c, http.StatusNotFound, "Video not found")
			return
		}

		videoPath := video.FilePath
		file, err := os.Open(videoPath)
		if err != nil {
			if os.IsNotExist(err) {
				respondError(c, http.StatusNotFound, "Video file not found on disk")
			} else {
				respondError(c, http.StatusInternalServerError, "Error accessing video file")
			}
			return
		}
		defer file.Close()

		fi, err := file.Stat()
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Unable to get file info")
			return
		}

		// Explicit headers
		c.Header("Content-Type", "video/mp4") // or infer from file if needed
		c.Header("Accept-Ranges", "bytes")
		c.Header("Content-Length", fmt.Sprintf("%d", fi.Size()))

		// Serve with range support
		http.ServeContent(c.Writer, c.Request, videoPath, fi.ModTime(), file)
	}
}
