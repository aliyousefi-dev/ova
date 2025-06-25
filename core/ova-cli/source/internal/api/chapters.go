package api

import (
	"net/http"
	"os"
	"path/filepath"

	"ova-cli/source/internal/datatypes"
	"ova-cli/source/internal/interfaces"

	"github.com/gin-gonic/gin"
)

// UpdateVttChaptersRequest is the JSON body expected for updating chapters.
type UpdateVttChaptersRequest struct {
	Chapters []datatypes.VttChapter `json:"chapters"`
}

// RegisterVttChapterRoutes adds the /video/chapters/:videoId endpoints.
func RegisterVttChapterRoutes(rg *gin.RouterGroup, storage interfaces.StorageService) {
	rg.POST("/video/chapters/:videoId", updateVttChapters(storage))
	rg.GET("/video/chapters/:videoId", getVttChapters(storage))
	rg.GET("/video/chapters/:videoId/file", getVttChapterFile(storage))
}

func updateVttChapters(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")
		if videoId == "" {
			respondError(c, http.StatusBadRequest, "videoId parameter is required")
			return
		}

		var req UpdateVttChaptersRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			respondError(c, http.StatusBadRequest, "Invalid JSON payload")
			return
		}

		err := storage.UpdateVttChapters(videoId, req.Chapters)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to update VTT chapters")
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{
			"videoId":  videoId,
			"chapters": req.Chapters,
		}, "VTT chapters updated successfully")
	}
}

func getVttChapters(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")
		if videoId == "" {
			respondError(c, http.StatusBadRequest, "videoId parameter is required")
			return
		}

		chapters, err := storage.GetVttChapters(videoId)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to get VTT chapters")
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{
			"videoId":  videoId,
			"chapters": chapters,
		}, "VTT chapters fetched successfully")
	}
}

func getVttChapterFile(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")
		if videoId == "" {
			respondError(c, http.StatusBadRequest, "videoId parameter is required")
			return
		}

		// Construct full path to the VTT file
		dir := storage.GetVideoChaptersDir()
		filePath := filepath.Join(dir, videoId+".vtt")

		// Check if file exists
		if _, err := os.Stat(filePath); err != nil {
			if os.IsNotExist(err) {
				respondError(c, http.StatusNotFound, "VTT chapter file not found")
				return
			}
			respondError(c, http.StatusInternalServerError, "Failed to access VTT chapter file")
			return
		}

		// Serve the file as text/vtt
		c.FileAttachment(filePath, videoId+".vtt")
	}
}
