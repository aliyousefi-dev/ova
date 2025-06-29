package api

import (
	"net/http"
	"os"
	"path/filepath"

	"ova-cli/source/internal/repo"

	"github.com/gin-gonic/gin"
)

// RegisterStoryboardRoutes registers the route to serve storyboard VTT files.
// It uses the RepoManager to get the root storage path dynamically.
func RegisterStoryboardRoutes(rg *gin.RouterGroup, repoManager *repo.RepoManager) {

	// Serve individual thumbnail elements
	rg.GET("/storyboards/:videoId/:filename", func(c *gin.Context) {
		videoId := c.Param("videoId")
		filename := c.Param("filename")

		thumbPath := filepath.Join(repoManager.GetStoryboardDir(), videoId, filename)

		info, err := os.Stat(thumbPath)
		if err != nil {
			if os.IsNotExist(err) {
				c.JSON(http.StatusNotFound, gin.H{"error": "Thumbnail not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to access thumbnail"})
			return
		}
		if info.IsDir() {
			c.JSON(http.StatusNotFound, gin.H{"error": "Thumbnail path is a directory"})
			return
		}

		// Serve the image file
		c.File(thumbPath)
	})
}
