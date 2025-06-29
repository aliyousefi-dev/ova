package api

import (
	"net/http"

	"ova-cli/source/internal/repo"

	"github.com/gin-gonic/gin"
)

// RegisterFolderRoutes sets up the GET /folders route using RepoManager.
func RegisterFolderRoutes(rg *gin.RouterGroup, rm *repo.RepoManager) {
	rg.GET("/folders", getFolderList(rm))
}

// getFolderList returns a list of unique folder paths containing videos.
func getFolderList(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		folders, err := rm.ScanDiskForFolders()
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to load folders")
			return
		}

		respondSuccess(c, http.StatusOK, folders, "Folders retrieved successfully")
	}
}
