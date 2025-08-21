package api

import (
	"net/http"

	"ova-cli/source/internal/repo"

	"github.com/gin-gonic/gin"
)

// RegisterSpaceRoutes sets up the GET /folders route using RepoManager.
func RegisterSpaceRoutes(rg *gin.RouterGroup, rm *repo.RepoManager) {
	rg.GET("/spaces/list", getSpaceList(rm))
}

// getSpaceList returns a list of unique folder paths containing videos.
func getSpaceList(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		spaces, err := rm.ScanDiskForFolders()
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to load folders")
			return
		}

		spaces = append(spaces, ".")

		respondSuccess(c, http.StatusOK, spaces, "Folders retrieved successfully")
	}
}
