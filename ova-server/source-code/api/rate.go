package api

import (
	"net/http"
	"ova-server/source-code/storage"

	"github.com/gin-gonic/gin"
)

// RatingRequest represents a request payload for posting rating.
type RatingRequest struct {
	Rating int `json:"rating"` // expected to be between 1 and 5
}

// RegisterVideoRatingRoutes adds rating-related endpoints to the router group.
func RegisterVideoRatingRoutes(rg *gin.RouterGroup, manager *storage.StorageManager, sm *SessionManager) {
	rg.POST("/rate/:videoId", postVideoRating(manager), sm.AuthRequired()) // POST /api/v1/videos/rate/{videoId}
	rg.GET("/rate/:videoId", getVideoRating(manager), sm.AuthRequired())   // GET /api/v1/videos/rate/{videoId}
}

// postVideoRating updates only the rating of a given video using persistent storage.
func postVideoRating(manager *storage.StorageManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")

		var req RatingRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			respondError(c, http.StatusBadRequest, "Invalid request payload")
			return
		}
		if req.Rating < 1 || req.Rating > 5 {
			respondError(c, http.StatusBadRequest, "Rating must be between 1 and 5")
			return
		}

		video, err := manager.Videos.FindVideo(videoId)
		if err != nil {
			respondError(c, http.StatusNotFound, "Video not found")
			return
		}

		video.Rating = float64(req.Rating)

		if err := manager.Videos.UpdateVideo(*video); err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to update video")
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{"videoId": videoId, "newRating": video.Rating}, "Rating updated")
	}
}

// getVideoRating returns the rating and view count for a video.
func getVideoRating(manager *storage.StorageManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")

		video, err := manager.Videos.FindVideo(videoId)
		if err != nil {
			respondError(c, http.StatusNotFound, "Video not found")
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{
			"videoId": videoId,
			"rating":  video.Rating,
			"views":   video.Views,
		}, "Video rating fetched")
	}
}
