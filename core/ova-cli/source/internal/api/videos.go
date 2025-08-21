// video.go
package api

import (
	"net/http"
	"path/filepath"
	"strings"

	"ova-cli/source/internal/datatypes"
	"ova-cli/source/internal/repo"

	"github.com/gin-gonic/gin"
)

// RegisterVideoRoutes adds video-related endpoints including folder listing.
func RegisterVideoRoutes(rg *gin.RouterGroup, repoMgr *repo.RepoManager) {
	videos := rg.Group("/videos")
	{
		videos.GET("/:videoId", getVideoByID(repoMgr)) // GET /api/v1/videos/{videoId}
		videos.GET("/:videoId/similar", getSimilarVideos(repoMgr))
		videos.GET("", getVideosByFolder(repoMgr))     // GET /api/v1/videos?folder=...
		videos.POST("/batch", getVideosByIds(repoMgr)) // POST /api/v1/videos/batch
	}
}

// getVideoByID returns details of a single video by ID.
func getVideoByID(repoMgr *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")

		video, err := repoMgr.GetVideoByID(videoId)
		if err != nil {
			respondError(c, http.StatusNotFound, "Video not found")
			return
		}
		respondSuccess(c, http.StatusOK, video, "Video retrieved successfully")
	}
}

// getVideosByFolder returns a list of videos inside the given folder path.
func getVideosByFolder(repoMgr *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		folderQuery := c.Query("folder")
		requestedPath := filepath.ToSlash(strings.Trim(folderQuery, "/"))

		videosInFolder, err := repoMgr.GetIndxedVideosOnSpace(requestedPath)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to load videos")
			return
		}

		response := gin.H{
			"videos": videosInFolder,
		}

		respondSuccess(c, http.StatusOK, response, "Videos in folder retrieved")
	}
}

// getVideosByIds returns a batch of videos by IDs.
func getVideosByIds(repoMgr *repo.RepoManager) gin.HandlerFunc {
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
			video, err := repoMgr.GetVideoByID(id)
			if err == nil && video != nil {
				matched = append(matched, *video)
			}
		}

		respondSuccess(c, http.StatusOK, matched, "Videos retrieved successfully")
	}
}

func getSimilarVideos(repoMgr *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")

		similarVideos, err := repoMgr.GetSimilarVideos(videoId)
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
