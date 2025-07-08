package api

import (
	"net/http"
	"os"

	"ova-cli/source/internal/repo"

	"github.com/gin-gonic/gin"
)

// RegisterPreviewRoutes registers the preview endpoint using the provided RepoManager.
func RegisterPreviewRoutes(rg *gin.RouterGroup, rm *repo.RepoManager) {
	rg.GET("/preview/:videoId", getPreview(rm))
}

// getPreview returns a handler function that serves a preview video file for a given video ID.
func getPreview(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")

		// Attempt to fetch the preview path using GetPreviewFilePathByVideoID
		previewPath := rm.GetPreviewFilePathByVideoID(videoId)

		// Check if the preview file exists
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
