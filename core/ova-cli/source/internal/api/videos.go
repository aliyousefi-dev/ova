package api

import (
	"net/http"
	"path/filepath"
	"strconv"
	"strings"

	"ova-cli/source/internal/datatypes"
	"ova-cli/source/internal/interfaces"

	"github.com/gin-gonic/gin"
)

func parseQueryInt(c *gin.Context, name string, defaultVal int) int {
	valStr := c.Query(name)
	if valStr == "" {
		return defaultVal
	}
	if val, err := strconv.Atoi(valStr); err == nil && val > 0 {
		return val
	}
	return defaultVal
}

// RegisterVideoRoutes adds video-related endpoints including folder listing.
func RegisterVideoRoutes(rg *gin.RouterGroup, storage interfaces.StorageService) {
	videos := rg.Group("/videos")
	{
		videos.GET("/:videoId", getVideoByID(storage)) // GET /api/v1/videos/{videoId}
		videos.GET("/:videoId/similar", getSimilarVideos(storage))
		videos.GET("", getVideosByFolder(storage))     // GET /api/v1/videos?folder=...
		videos.POST("/batch", getVideosByIds(storage)) // POST /api/v1/videos/batch
	}

	// New folder route
	rg.GET("/folders", getFolderList(storage))
}

// getVideoByID returns details of a single video by ID.
func getVideoByID(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")

		video, err := storage.GetVideoByID(videoId)
		if err != nil {
			respondError(c, http.StatusNotFound, "Video not found")
			return
		}
		respondSuccess(c, http.StatusOK, video, "Video retrieved successfully")
	}
}

// getVideosByFolder returns a paginated list of videos inside the given folder path.
func getVideosByFolder(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		folderQuery := c.Query("folder")
		requestedPath := filepath.ToSlash(strings.Trim(folderQuery, "/"))

		videosInFolder, err := storage.GetVideosByFolder(requestedPath)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to load videos")
			return
		}

		// Return all videos, no pagination here
		response := gin.H{
			"videos": videosInFolder,
		}

		respondSuccess(c, http.StatusOK, response, "Videos in folder retrieved")
	}
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

// getVideosByIds returns a batch of videos by IDs.
func getVideosByIds(storage interfaces.StorageService) gin.HandlerFunc {
	type requestBody struct {
		IDs []string `json:"ids"`
	}
	return func(c *gin.Context) {
		var body requestBody
		if err := c.ShouldBindJSON(&body); err != nil {
			respondError(c, http.StatusBadRequest, "Invalid request")
			return
		}

		var matched []datatypes.VideoData
		for _, id := range body.IDs {
			if video, err := storage.GetVideoByID(id); err == nil {
				matched = append(matched, *video)
			}
		}

		respondSuccess(c, http.StatusOK, matched, "Videos retrieved successfully")
	}
}

func getSimilarVideos(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")

		similarVideos, err := storage.GetSimilarVideos(videoId)
		if err != nil {
			respondError(c, http.StatusNotFound, "Video not found or no similar videos")
			return
		}

		// Limit to 8 items
		if len(similarVideos) > 8 {
			similarVideos = similarVideos[:8]
		}

		response := gin.H{
			"similarVideos": similarVideos,
		}

		respondSuccess(c, http.StatusOK, response, "Similar videos retrieved successfully")
	}
}
