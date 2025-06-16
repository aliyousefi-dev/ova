package api

import (
	"net/http"

	"ova-cli/source/internal/interfaces"

	"github.com/gin-gonic/gin"
)

// RegisterFolderRoutes sets up the GET /folders route.
func RegisterFolderRoutes(rg *gin.RouterGroup, storage interfaces.StorageService) {
	rg.GET("/folders", getFolderList(storage))
}

// getFolderList returns a list of unique folder paths containing videos.
func getFolderList(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		folders, err := storage.GetFolderList()
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to load folders")
			return
		}

		respondSuccess(c, http.StatusOK, folders, "Folders retrieved successfully")
	}
}
