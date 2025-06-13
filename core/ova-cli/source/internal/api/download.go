package api

import (
	"net/http"
	"os"
	"ova-cli/source/internal/interfaces"

	"github.com/gin-gonic/gin"
)

func RegisterDownloadRoutes(rg *gin.RouterGroup, storage interfaces.StorageService) {
	rg.GET("/download/:videoId", downloadVideo(storage))
}

func downloadVideo(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")

		video, err := storage.GetVideoByID(videoId)
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

		// Set header to force download
		c.Header("Content-Disposition", "attachment; filename=\""+video.Title+".mp4\"")
		c.Header("Content-Type", "application/octet-stream")
		c.File(videoPath)
	}
}
