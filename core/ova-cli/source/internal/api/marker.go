package api

import (
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"ova-cli/source/internal/datatypes"
	"ova-cli/source/internal/interfaces"

	"github.com/gin-gonic/gin"
)

// UpdateMarkersRequest defines the expected JSON payload for updating markers.
type UpdateMarkersRequest struct {
	Markers []datatypes.VideoMarker `json:"markers"`
}

// RegisterMarkerRoutes sets up the API endpoints for marker management.
func RegisterMarkerRoutes(rg *gin.RouterGroup, storage interfaces.StorageService) {
	rg.POST("/video/markers/:videoId", updateMarkers(storage))
	rg.GET("/video/markers/:videoId", getMarkers(storage))
	rg.GET("/video/markers/:videoId/file", getMarkerFile(storage))
	rg.DELETE("/video/markers/:videoId", deleteAllMarkers(storage))
	rg.DELETE("/video/markers/:videoId/:timestamp", deleteMarker(storage))
}

// updateMarkers handles POST requests to update markers for a specific video.
func updateMarkers(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")
		if videoId == "" {
			respondError(c, http.StatusBadRequest, "videoId parameter is required")
			return
		}

		var req UpdateMarkersRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			respondError(c, http.StatusBadRequest, "Invalid JSON payload: "+err.Error())
			return
		}

		// Validate markers
		for _, marker := range req.Markers {
			if marker.Timestamp < 0 {
				respondError(c, http.StatusBadRequest, "Marker timestamps cannot be negative")
				return
			}
			if strings.TrimSpace(marker.Title) == "" {
				respondError(c, http.StatusBadRequest, "Marker title cannot be empty")
				return
			}
		}

		// For simplicity, delete all existing markers and add the new list
		if err := storage.DeleteAllMarkersFromVideo(videoId); err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to clear existing markers: "+err.Error())
			return
		}
		for _, marker := range req.Markers {
			if err := storage.AddMarkerToVideo(videoId, marker); err != nil {
				respondError(c, http.StatusInternalServerError, "Failed to add marker: "+err.Error())
				return
			}
		}

		updatedMarkers, err := storage.GetMarkersForVideo(videoId)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to retrieve updated markers: "+err.Error())
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{
			"videoId": videoId,
			"markers": updatedMarkers,
		}, "Markers updated successfully")
	}
}

// getMarkers handles GET requests to retrieve markers data in JSON format.
func getMarkers(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")
		if videoId == "" {
			respondError(c, http.StatusBadRequest, "videoId parameter is required")
			return
		}

		markers, err := storage.GetMarkersForVideo(videoId)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to get markers: "+err.Error())
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{
			"videoId": videoId,
			"markers": markers,
		}, "Markers fetched successfully")
	}
}

// getMarkerFile serves the VTT file for markers for the given videoId.
func getMarkerFile(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")
		if videoId == "" {
			respondError(c, http.StatusBadRequest, "videoId parameter is required")
			return
		}

		dir := storage.GetVideoChaptersDir() // you may want to rename this method if it's generic storage for markers
		filePath := filepath.Join(dir, videoId+".vtt")

		if _, err := os.Stat(filePath); err != nil {
			if os.IsNotExist(err) {
				respondError(c, http.StatusNotFound, "VTT marker file not found for videoId: "+videoId)
				return
			}
			respondError(c, http.StatusInternalServerError, "Failed to access VTT marker file: "+err.Error())
			return
		}

		c.Header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
		c.Header("Pragma", "no-cache")
		c.Header("Expires", "0")
		c.Header("Surrogate-Control", "no-store")

		c.Header("Content-Type", "text/vtt")

		c.File(filePath)
	}
}

// deleteAllMarkers deletes all markers associated with a video.
func deleteAllMarkers(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")
		if videoId == "" {
			respondError(c, http.StatusBadRequest, "videoId parameter is required")
			return
		}

		if err := storage.DeleteAllMarkersFromVideo(videoId); err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to delete all markers: "+err.Error())
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{
			"videoId": videoId,
		}, "All markers deleted successfully")
	}
}

// deleteMarker deletes a single marker from a video.
// Here the marker is identified by its timestamp passed as a string parameter.
func deleteMarker(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")
		timestampStr := c.Param("timestamp")
		if videoId == "" || timestampStr == "" {
			respondError(c, http.StatusBadRequest, "videoId and timestamp parameters are required")
			return
		}

		// Convert timestamp param to float64 for matching marker
		timestamp, err := strconv.ParseFloat(timestampStr, 64)
		if err != nil {
			respondError(c, http.StatusBadRequest, "Invalid timestamp parameter")
			return
		}

		markers, err := storage.GetMarkersForVideo(videoId)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to get markers: "+err.Error())
			return
		}

		// Find marker with matching timestamp to delete
		var markerToDelete *datatypes.VideoMarker
		for _, m := range markers {
			if m.Timestamp == timestamp {
				markerToDelete = &m
				break
			}
		}

		if markerToDelete == nil {
			respondError(c, http.StatusNotFound, "Marker not found")
			return
		}

		if err := storage.DeleteMarkerFromVideo(videoId, *markerToDelete); err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to delete marker: "+err.Error())
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{
			"videoId":   videoId,
			"timestamp": timestamp,
		}, "Marker deleted successfully")
	}
}
