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

// RegisterAuthRoutes sets up the /auth routes with session and user storage.
func RegisterAuthRoutes(rg *gin.RouterGroup, storage interfaces.StorageService, sm *SessionManager) {
	auth := rg.Group("/auth")
	{
		auth.POST("/login", func(c *gin.Context) { loginHandler(c, sm, storage) })
		auth.POST("/logout", sm.logoutHandler)
		auth.GET("/status", sm.authStatusHandler)
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
