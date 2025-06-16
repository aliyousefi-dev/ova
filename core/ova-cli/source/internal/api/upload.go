package api

import (
	"net/http"
	"path/filepath"
	"strings"

	"ova-cli/source/internal/datatypes"
	"ova-cli/source/internal/interfaces"
	"ova-cli/source/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func RegisterUploadRoutes(rg *gin.RouterGroup, storage interfaces.StorageService) {
	rg.POST("/upload", uploadVideo(storage))
}

func uploadVideo(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get folder from form
		folder := strings.TrimSpace(c.PostForm("folder"))
		if folder == "" {
			respondError(c, http.StatusBadRequest, "Folder path is required")
			return
		}

		// Sanitize and resolve full folder path
		basePath := "." // You can make this configurable
		fullFolderPath := filepath.Join(basePath, folder)
		if !repository.FolderExists(fullFolderPath) {
			respondError(c, http.StatusBadRequest, "Folder does not exist")
			return
		}

		// Get the file from form
		file, err := c.FormFile("file")
		if err != nil {
			respondError(c, http.StatusBadRequest, "Video file is required")
			return
		}

		// Save file in the specified folder with a unique name
		filename := uuid.New().String() + filepath.Ext(file.Filename)
		savePath := filepath.Join(fullFolderPath, filename)
		if err := c.SaveUploadedFile(file, savePath); err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to save video file")
			return
		}

		// Build minimal video metadata
		video := datatypes.VideoData{
			VideoID:  uuid.New().String(),
			FilePath: savePath,
		}

		respondSuccess(c, http.StatusOK, video, "Video uploaded successfully")
	}
}
