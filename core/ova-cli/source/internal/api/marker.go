package api

import (
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"ova-cli/source/internal/datatypes"  // Import the updated datatypes package
	"ova-cli/source/internal/interfaces" // Assuming interfaces.StorageService is defined here

	// Ensure common response functions like respondError and respondSuccess are accessible
	// from your API package or utility functions.
	// For example:
	// "ova-cli/source/internal/utils" // If respondError/respondSuccess are here

	"github.com/gin-gonic/gin"
)

// RegisterMarkerRoutes sets up the API endpoints for marker management.
func RegisterMarkerRoutes(rg *gin.RouterGroup, storage interfaces.StorageService) {
	rg.POST("/video/markers/:videoId", updateMarkers(storage))
	rg.GET("/video/markers/:videoId", getMarkers(storage))
	rg.GET("/video/markers/:videoId/file", getMarkerFile(storage))
	rg.DELETE("/video/markers/:videoId", deleteAllMarkers(storage))
	// Updated DELETE route to accept hour, minute, and second as parameters for precise deletion
	rg.DELETE("/video/markers/:videoId/:hour/:minute/:second", deleteMarker(storage))
}

// updateMarkers handles POST requests to update markers for a specific video.
func updateMarkers(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")
		if videoId == "" {
			respondError(c, http.StatusBadRequest, "videoId parameter is required")
			return
		}

		var req datatypes.UpdateMarkersRequest // Use datatypes.UpdateMarkersRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			respondError(c, http.StatusBadRequest, "Invalid JSON payload: "+err.Error())
			return
		}

		var markersToSave []datatypes.VideoMarker
		for _, vm := range req.Markers { // Loop using the VideoMarker struct
			// Validate incoming hour, minute, second
			if vm.Hour < 0 || vm.Minute < 0 || vm.Second < 0 {
				respondError(c, http.StatusBadRequest, "Marker hour, minute, and second cannot be negative")
				return
			}
			if vm.Minute >= 60 || vm.Second >= 60 {
				respondError(c, http.StatusBadRequest, "Minute and second values must be less than 60")
				return
			}
			if strings.TrimSpace(vm.Title) == "" {
				respondError(c, http.StatusBadRequest, "Marker title cannot be empty")
				return
			}
			// Markers are already in the desired datatypes.VideoMarker format (H,M,S,Title)
			markersToSave = append(markersToSave, vm)
		}

		// Delete all existing markers and add the new list.
		if err := storage.DeleteAllMarkersFromVideo(videoId); err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to clear existing markers: "+err.Error())
			return
		}
		for _, marker := range markersToSave {
			// storage.AddMarkerToVideo now directly accepts datatypes.VideoMarker (H,M,S,Title)
			if err := storage.AddMarkerToVideo(videoId, marker); err != nil {
				respondError(c, http.StatusInternalServerError, "Failed to add marker: "+err.Error())
				return
			}
		}

		// Prepare response for frontend: get markers from storage
		// storage.GetMarkersForVideo now returns datatypes.VideoMarker (H,M,S,Title)
		markersForResponse, err := storage.GetMarkersForVideo(videoId)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to retrieve updated markers: "+err.Error())
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{
			"videoId": videoId,
			"markers": markersForResponse, // Send datatypes.VideoMarker (H,M,S,Title) directly
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

		// Get markers from storage (which now returns datatypes.VideoMarker with H,M,S,Title)
		markersForResponse, err := storage.GetMarkersForVideo(videoId)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to get markers: "+err.Error())
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{
			"videoId": videoId,
			"markers": markersForResponse, // Send datatypes.VideoMarker (H,M,S,Title) directly
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

		dir := storage.GetVideoMarkerDir() // Use the dedicated method to get the markers directory
		filePath := filepath.Join(dir, videoId+".vtt")

		if _, err := os.Stat(filePath); err != nil {
			if os.IsNotExist(err) {
				respondError(c, http.StatusNotFound, "VTT marker file not found for videoId: "+videoId)
				return
			}
			respondError(c, http.StatusInternalServerError, "Failed to access VTT marker file: "+err.Error())
			return
		}

		// Set appropriate headers for VTT file
		c.Header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
		c.Header("Pragma", "no-cache")
		c.Header("Expires", "0")
		c.Header("Surrogate-Control", "no-store")

		c.Header("Content-Type", "text/vtt") // Set Content-Type to text/vtt

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

// deleteMarker handles DELETE requests to remove a single marker from a video.
// It accepts hour, minute, and second in the URL parameters.
func deleteMarker(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")
		hourStr := c.Param("hour")
		minuteStr := c.Param("minute")
		secondStr := c.Param("second")

		if videoId == "" || hourStr == "" || minuteStr == "" || secondStr == "" {
			respondError(c, http.StatusBadRequest, "videoId, hour, minute, and second parameters are required")
			return
		}

		// Convert incoming hour, minute, second URL params to integers.
		hour, err := strconv.Atoi(hourStr)
		if err != nil {
			respondError(c, http.StatusBadRequest, "Invalid hour parameter, must be an integer: "+err.Error())
			return
		}
		minute, err := strconv.Atoi(minuteStr)
		if err != nil {
			respondError(c, http.StatusBadRequest, "Invalid minute parameter, must be an integer: "+err.Error())
			return
		}
		second, err := strconv.Atoi(secondStr)
		if err != nil {
			respondError(c, http.StatusBadRequest, "Invalid second parameter, must be an integer: "+err.Error())
			return
		}

		// Create a VideoMarker instance with the values to delete
		markerToDelete := datatypes.VideoMarker{
			Hour:   hour,
			Minute: minute,
			Second: second,
			// Title is not available from URL, so it's not included in deletion criteria.
			// The storage layer will need to match solely on the timestamp (H,M,S).
		}

		// Call storage delete using the new datatypes.VideoMarker (with H,M,S).
		if err := storage.DeleteMarkerFromVideo(videoId, markerToDelete); err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to delete marker: "+err.Error())
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{
			"videoId": videoId,
			"hour":    hour,
			"minute":  minute,
			"second":  second,
		}, "Marker deleted successfully")
	}
}
