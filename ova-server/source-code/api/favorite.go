package api

import (
	"net/http"
	"time"

	"ova-server/source-code/storage"
	datatypes "ova-server/source-code/storage/datatypes"

	"github.com/gin-gonic/gin"
)

// FavoritesUpdate represents the request payload for updating the favorites list.
type FavoritesUpdate struct {
	Favorites []string `json:"favorites"`
}

// RegisterUserFavoritesRoutes adds user-related endpoints to the router group using the provided StorageManager.
func RegisterUserFavoritesRoutes(rg *gin.RouterGroup, manager *storage.StorageManager) {
	users := rg.Group("/users")
	{
		users.GET("/:username/favorites", getUserFavorites(manager))
		users.POST("/:username/favorites", updateUserFavorites(manager))
	}
}

// GET /users/:username/favorites — return user's favorite videos
func getUserFavorites(manager *storage.StorageManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")

		users, err := manager.Users.LoadUsers()
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to load users")
			return
		}

		user, ok := users[username]
		if !ok {
			respondError(c, http.StatusNotFound, "User not found")
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{"username": username, "favorites": user.Favorites}, "Favorites retrieved")
	}
}

// POST /users/:username/favorites — update user's favorite videos
func updateUserFavorites(manager *storage.StorageManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")

		var payload FavoritesUpdate
		if err := c.ShouldBindJSON(&payload); err != nil {
			respondError(c, http.StatusBadRequest, "Invalid request payload")
			return
		}

		validFavorites := make([]string, 0, len(payload.Favorites))
		for _, videoID := range payload.Favorites {
			if _, err := manager.Videos.FindVideo(videoID); err == nil {
				validFavorites = append(validFavorites, videoID)
			}
		}

		if len(validFavorites) == 0 {
			respondError(c, http.StatusBadRequest, "No valid video IDs found")
			return
		}

		user, err := manager.Users.FindUser(username)
		if err != nil {
			// User doesn't exist, create new one
			user = &datatypes.UserData{
				Username:  username,
				CreatedAt: time.Now().UTC(),
				Favorites: validFavorites,
			}
			if err := manager.Users.AddUser(*user); err != nil {
				respondError(c, http.StatusInternalServerError, "Failed to create user")
				return
			}
			respondSuccess(c, http.StatusOK, gin.H{"username": username, "favorites": validFavorites}, "User created with favorite videos")
			return
		}

		user.Favorites = validFavorites
		if err := manager.Users.UpdateUser(*user); err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to update favorites")
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{"username": username, "favorites": validFavorites}, "Favorites updated")
	}
}
