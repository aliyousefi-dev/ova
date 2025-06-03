package api

import (
	"fmt"
	"net/http"
	"ova-server/source-code/storage"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// SessionManager manages user sessions.
type SessionManager struct {
	sessions map[string]string // sessionID -> username
}

// NewSessionManager initializes a new session manager.
func NewSessionManager() *SessionManager {
	return &SessionManager{
		sessions: make(map[string]string),
	}
}

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
func RegisterAuthRoutes(rg *gin.RouterGroup, manager *storage.StorageManager, sm *SessionManager) {
	auth := rg.Group("/auth")
	{
		auth.POST("/login", func(c *gin.Context) { loginHandler(c, sm, manager) })
		auth.POST("/logout", sm.logoutHandler)
	}
}

// loginHandler authenticates the user and issues a session.
func loginHandler(c *gin.Context, sm *SessionManager, manager *storage.StorageManager) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "Invalid JSON")
		return
	}

	user, err := manager.Users.FindUser(req.Username)
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
	cookieValue := fmt.Sprintf("session_id=%s; Path=/; Max-Age=%d; HttpOnly;",
		sessionID, int(24*time.Hour.Seconds()))
	c.Writer.Header().Add("Set-Cookie", cookieValue)

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
