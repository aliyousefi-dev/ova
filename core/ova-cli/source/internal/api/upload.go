package api

import (
	"log"
	"net/http"
	"path/filepath"
	"strings"

	"ova-cli/source/internal/datatypes"
	"ova-cli/source/internal/repo"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func RegisterUploadRoutes(rg *gin.RouterGroup, repoMgr *repo.RepoManager) {
	rg.POST("/upload", uploadVideo(repoMgr))
}

func uploadVideo(repoMgr *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get folder from form
		folder := strings.TrimSpace(c.PostForm("folder"))

		basePath := "." // configurable base path

		// If folder is empty, upload to base path (root)
		fullFolderPath := basePath
		if folder != "" {
			fullFolderPath = filepath.Join(basePath, folder)
			if !repoMgr.FolderExists(fullFolderPath) {
				respondError(c, http.StatusBadRequest, "Folder does not exist")
				return
			}
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
		log.Printf("Saving file %s to path: %s", file.Filename, savePath)
		if err := c.SaveUploadedFile(file, savePath); err != nil {
			log.Printf("SaveUploadedFile error: %v", err)
			respondError(c, http.StatusInternalServerError, "Failed to save video file")
			return
		}
		log.Printf("File saved successfully to %s", savePath)

		// Build minimal video metadata
		video := datatypes.VideoData{
			VideoID:  uuid.New().String(),
			FileName: savePath,
		}

		respondSuccess(c, http.StatusOK, video, "Video uploaded successfully")
	}
}
