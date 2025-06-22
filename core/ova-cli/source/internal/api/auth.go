package api

import (
	"net/http"
	"ova-cli/source/internal/interfaces"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// LoginRequest represents the login request body.
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// LoginResponse represents the login response body.
type LoginResponse struct {
	SessionID string `json:"sessionId"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"oldpassword"`
	NewPassword string `json:"newpassword"`
}

// RegisterAuthRoutes sets up the /auth routes with session and user storage.
func RegisterAuthRoutes(rg *gin.RouterGroup, storage interfaces.StorageService, sm *SessionManager) {
	auth := rg.Group("/auth")
	{
		auth.POST("/login", func(c *gin.Context) { loginHandler(c, sm, storage) })
		auth.POST("/logout", sm.logoutHandler)
		auth.GET("/status", sm.authStatusHandler)
		auth.GET("/profile", sm.profileHandler(storage))
		auth.POST("/password", sm.passwordHandler(storage))
	}
}

// loginHandler authenticates the user and issues a session.
func loginHandler(c *gin.Context, sm *SessionManager, storage interfaces.StorageService) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "Invalid JSON")
		return
	}

	user, err := storage.GetUserByUsername(req.Username)
	if err != nil {
		respondError(c, http.StatusUnauthorized, "Invalid username or password")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		respondError(c, http.StatusUnauthorized, "Invalid username or password")
		return
	}

	sessionID := uuid.NewString()
	sm.sessions[sessionID] = req.Username

	// Set cookie manually with SameSite=None and Secure for cross-origin cookies
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "session_id",
		Value:    sessionID,
		Path:     "/",
		MaxAge:   int(24 * time.Hour.Seconds()),
		HttpOnly: false,                // Allow JS access
		Secure:   false,                // Must be false on HTTP
		SameSite: http.SameSiteLaxMode, // Works on HTTP
	})

	respondSuccess(c, http.StatusOK, LoginResponse{SessionID: sessionID}, "Login successful")
}

// logoutHandler clears the session.
func (sm *SessionManager) logoutHandler(c *gin.Context) {
	sessionID, err := c.Cookie("session_id")
	if err != nil {
		respondError(c, http.StatusUnauthorized, "No session found")
		return
	}

	if _, exists := sm.sessions[sessionID]; !exists {
		respondError(c, http.StatusUnauthorized, "Invalid session")
		return
	}

	delete(sm.sessions, sessionID)

	// Clear cookie by setting expired cookie with SameSite=None and Secure
	clearCookie := "session_id=; Path=/; Max-Age=0; HttpOnly; SameSite=None;"
	c.Writer.Header().Add("Set-Cookie", clearCookie)

	respondSuccess(c, http.StatusOK, gin.H{}, "Logged out successfully")
}

func (sm *SessionManager) authStatusHandler(c *gin.Context) {
	if sm.DisableAuth {
		// Auth is disabled, always respond successful
		respondSuccess(c, http.StatusOK, gin.H{
			"authenticated": true,
			"username":      "guest",
		}, "Auth disabled: automatic success")
		return
	}

	sessionID, err := c.Cookie("session_id")
	if err != nil {
		respondSuccess(c, http.StatusOK, gin.H{"authenticated": false}, "Not authenticated")
		return
	}

	username, exists := sm.sessions[sessionID]
	if exists {
		respondSuccess(c, http.StatusOK, gin.H{
			"authenticated": true,
			"username":      username,
		}, "Status check successful")
	} else {
		respondSuccess(c, http.StatusOK, gin.H{"authenticated": false}, "Not authenticated")
	}
}

func (sm *SessionManager) profileHandler(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		sessionID, err := c.Cookie("session_id")
		if err != nil {
			respondError(c, http.StatusUnauthorized, "No session found")
			return
		}

		username, exists := sm.sessions[sessionID]
		if !exists {
			respondError(c, http.StatusUnauthorized, "Invalid session")
			return
		}

		user, err := storage.GetUserByUsername(username)
		if err != nil {
			respondError(c, http.StatusNotFound, "User not found")
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"username": user.Username,
			"roles":    user.Roles,
		})
	}
}

func (sm *SessionManager) passwordHandler(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req ChangePasswordRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			respondError(c, http.StatusBadRequest, "Invalid JSON payload")
			return
		}

		sessionID, err := c.Cookie("session_id")
		if err != nil {
			respondSuccess(c, http.StatusOK, gin.H{"authenticated": false}, "Not authenticated")
			return
		}

		username, exists := sm.sessions[sessionID]
		if !exists {
			respondError(c, http.StatusUnauthorized, "not Authenticated!")
		}

		user, err := storage.GetUserByUsername(username)
		if err != nil {
			respondError(c, http.StatusUnauthorized, "Invalid username")
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.OldPassword)); err != nil {
			respondError(c, http.StatusUnauthorized, "Invalid password")
			return
		}

		// Hash the password securely using bcrypt
		hashBytes, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Can not Create Hash from password")
			return
		}
		hashedPassword := string(hashBytes)

		storageerr := storage.UpdateUserPassword(username, hashedPassword)
		if storageerr != nil {
			respondError(c, http.StatusForbidden, storageerr.Error())
		} else {
			respondSuccess(c, http.StatusOK, gin.H{
				"status": "ok",
			}, "Password Changed!")
		}
	}
}
