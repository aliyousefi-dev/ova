package api

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"ova-cli/source/internal/repo"

	"github.com/gin-gonic/gin"
)

// RegisterStreamRoutes registers the streaming endpoint using the provided RepoManager.
func RegisterStreamRoutes(rg *gin.RouterGroup, repoManager *repo.RepoManager) {
	rg.GET("/stream/:videoId", streamVideo(repoManager))
	rg.HEAD("/stream/:videoId", streamVideo(repoManager)) // vidstack needs this for loading the video
}

// streamVideo returns a handler function that streams a video file by its ID.
func streamVideo(repoManager *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")

		video, err := repoManager.GetVideoByID(videoId)
		if err != nil {
			respondError(c, http.StatusNotFound, "Video not found")
			return
		}

		videoPath := filepath.Join(video.OwnedSpace, video.FileName+video.Codecs.Format)
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
