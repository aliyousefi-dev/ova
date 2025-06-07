package api

import (
	"log"
	"net/http"
	"path/filepath"
	"strings"

	"ova-cli/storage"
	"ova-cli/storage/datatypes"

	"github.com/gin-gonic/gin"
)

// RegisterVideoRoutes adds video-related endpoints including folder listing.
func RegisterVideoRoutes(rg *gin.RouterGroup, manager *storage.StorageManager) {
	videos := rg.Group("/videos")
	{
		videos.GET("/:videoId", getVideoByID(manager)) // GET /api/v1/videos/{videoId}
		videos.GET("", getVideosByFolder(manager))     // ✅ GET /api/v1/videos?folder=...
		videos.POST("/batch", getVideosByIds(manager))
	}

	// New folder route
	rg.GET("/folders", getFolderList(manager))
}

// getVideoByID returns details of a single video by ID.
func getVideoByID(manager *storage.StorageManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")

		video, err := manager.Videos.FindVideo(videoId)
		if err != nil {
			respondError(c, http.StatusNotFound, "Video not found")
			return
		}
		respondSuccess(c, http.StatusOK, video, "Video retrieved successfully")
	}
}

// getVideosByFolder returns a list of videos inside the given folder path.
func getVideosByFolder(manager *storage.StorageManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		folderQuery := c.Query("folder")
		requestedPath := filepath.ToSlash(strings.Trim(folderQuery, "/"))

		videosMap, err := manager.Videos.LoadVideos()
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to load videos")
			return
		}

		var videosInFolder []datatypes.VideoData
		for _, video := range videosMap {
			relPath := filepath.ToSlash(video.FilePath)
			videoFolder := strings.Trim(filepath.ToSlash(filepath.Dir(relPath)), "/")
			if videoFolder == "." {
				videoFolder = ""
			}

			log.Printf("Video: %s | FilePath: %s | Folder: %s", video.Title, relPath, videoFolder)
			log.Printf("Comparing with requested: %s", requestedPath)

			if requestedPath == "" {
				if videoFolder == "" {
					videosInFolder = append(videosInFolder, video)
				}
			} else {
				if videoFolder == requestedPath {
					videosInFolder = append(videosInFolder, video)
				}
			}
		}

		respondSuccess(c, http.StatusOK, videosInFolder, "Videos in folder retrieved")
	}
}

// getFolderList returns a list of unique folder paths containing videos.
func getFolderList(manager *storage.StorageManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videosMap, err := manager.Videos.LoadVideos()
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to load videos")
			return
		}

		folderSet := make(map[string]struct{})

		for _, video := range videosMap {
			relPath := filepath.ToSlash(video.FilePath)
			folder := strings.Trim(filepath.ToSlash(filepath.Dir(relPath)), "/")
			if folder == "." {
				folder = ""
			}
			folderSet[folder] = struct{}{}
		}

		// Convert set keys to slice
		folders := make([]string, 0, len(folderSet))
		for folder := range folderSet {
			folders = append(folders, folder)
		}

		respondSuccess(c, http.StatusOK, folders, "Folders retrieved successfully")
	}
}

func getVideosByIds(manager *storage.StorageManager) gin.HandlerFunc {
	type requestBody struct {
		IDs []string `json:"ids"`
	}
	return func(c *gin.Context) {
		var body requestBody
		if err := c.ShouldBindJSON(&body); err != nil {
			respondError(c, http.StatusBadRequest, "Invalid request")
			return
		}

		videosMap, err := manager.Videos.LoadVideos()
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to load videos")
			return
		}

		var matched []datatypes.VideoData
		for _, id := range body.IDs {
			if video, ok := videosMap[id]; ok {
				matched = append(matched, video)
			}
		}

		respondSuccess(c, http.StatusOK, matched, "Videos retrieved successfully")
	}
}
