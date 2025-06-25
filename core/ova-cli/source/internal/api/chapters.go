package api

import (
	"net/http"
	"os"
	"path/filepath"
	"strings" // Import strings package for TrimSpace

	"ova-cli/source/internal/datatypes"
	"ova-cli/source/internal/interfaces"

	"github.com/gin-gonic/gin"
)

// UpdateVttChaptersRequest defines the expected JSON payload for updating video chapters.
type UpdateVttChaptersRequest struct {
	Chapters []datatypes.VttChapter `json:"chapters"`
}

// RegisterVttChapterRoutes sets up the API endpoints for VTT chapter management.
func RegisterVttChapterRoutes(rg *gin.RouterGroup, storage interfaces.StorageService) {
	rg.POST("/video/chapters/:videoId", updateVttChapters(storage))
	rg.GET("/video/chapters/:videoId", getVttChapters(storage))
	rg.GET("/video/chapters/:videoId/file", getVttChapterFile(storage))
}

// updateVttChapters handles POST requests to update VTT chapters for a specific video.
func updateVttChapters(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")
		if videoId == "" {
			respondError(c, http.StatusBadRequest, "videoId parameter is required")
			return
		}

		var req UpdateVttChaptersRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			respondError(c, http.StatusBadRequest, "Invalid JSON payload: "+err.Error())
			return
		}

		// Validate input chapter data before processing.
		for _, chapter := range req.Chapters {
			if chapter.StartTime < 0 {
				respondError(c, http.StatusBadRequest, "Chapter start times cannot be negative")
				return
			}
			// NEW VALIDATION: Ensure chapter title is not empty after trimming whitespace
			if strings.TrimSpace(chapter.Title) == "" {
				respondError(c, http.StatusBadRequest, "Chapter title cannot be empty")
				return
			}
		}

		err := storage.UpdateVttChapters(videoId, req.Chapters)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to update VTT chapters: "+err.Error())
			return
		}

		// Re-fetch chapters after update to ensure the client receives the sorted/processed version
		// from the storage layer.
		updatedChapters, err := storage.GetVttChapters(videoId)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to retrieve updated VTT chapters: "+err.Error())
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{
			"videoId":  videoId,
			"chapters": updatedChapters, // Return the actually saved and potentially reordered chapters
		}, "VTT chapters updated successfully")
	}
}

// getVttChapters handles GET requests to retrieve VTT chapter data in JSON format.
func getVttChapters(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")
		if videoId == "" {
			respondError(c, http.StatusBadRequest, "videoId parameter is required")
			return
		}

		chapters, err := storage.GetVttChapters(videoId)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to get VTT chapters: "+err.Error())
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

		dir := storage.GetVideoChaptersDir()
		filePath := filepath.Join(dir, videoId+".vtt")

		if _, err := os.Stat(filePath); err != nil {
			if os.IsNotExist(err) {
				respondError(c, http.StatusNotFound, "VTT chapter file not found for videoId: "+videoId)
				return
			}
			respondError(c, http.StatusInternalServerError, "Failed to access VTT chapter file: "+err.Error())
			return
		}

		// Prevent caching
		c.Header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
		c.Header("Pragma", "no-cache")
		c.Header("Expires", "0")
		c.Header("Surrogate-Control", "no-store")

		// Set proper content type
		c.Header("Content-Type", "text/vtt")

		c.File(filePath)
	}
}
