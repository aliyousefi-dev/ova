package api

import (
	"net/http"
	"time"

	"ova-cli/source/internal/repo"

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

// RegisterAuthRoutes sets up the /auth routes with session and repo manager.
func RegisterAuthRoutes(rg *gin.RouterGroup, repoMgr *repo.RepoManager, sm *SessionManager) {
	auth := rg.Group("/auth")
	{
		auth.POST("/login", func(c *gin.Context) { loginHandler(c, sm, repoMgr) })
		auth.POST("/logout", sm.logoutHandler)
		auth.GET("/status", sm.authStatusHandler)
		auth.GET("/profile", sm.profileHandler(repoMgr))
		auth.POST("/password", sm.passwordHandler(repoMgr))
	}
}

// loginHandler authenticates the user and issues a session.
func loginHandler(c *gin.Context, sm *SessionManager, repoMgr *repo.RepoManager) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "Invalid JSON")
		return
	}

	user, err := repoMgr.GetUserByUsername(req.Username)
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
    http.SetCookie(c.Writer, &http.Cookie{
        Name:     "session_id",
        Value:    sessionID,
        Path:     "/",
        MaxAge:   int(24 * time.Hour.Seconds()),
		HttpOnly: true,  // Set to true for security
		Secure:   false,  // Keep as false for HTTP
	})

	respondSuccess(c, http.StatusOK, LoginResponse{SessionID: sessionID}, "Login successful")
}

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

	clearCookie := "session_id=; Path=/; Max-Age=0; HttpOnly; SameSite=None;"
	c.Writer.Header().Add("Set-Cookie", clearCookie)

	respondSuccess(c, http.StatusOK, gin.H{}, "Logged out successfully")
}

func (sm *SessionManager) authStatusHandler(c *gin.Context) {
	if sm.DisableAuth {
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

func (sm *SessionManager) profileHandler(repoMgr *repo.RepoManager) gin.HandlerFunc {
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

		user, err := repoMgr.GetUserByUsername(username)
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

func (sm *SessionManager) passwordHandler(repoMgr *repo.RepoManager) gin.HandlerFunc {
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
			respondError(c, http.StatusUnauthorized, "Not authenticated")
			return
		}

		user, err := repoMgr.GetUserByUsername(username)
		if err != nil {
			respondError(c, http.StatusUnauthorized, "Invalid username")
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.OldPassword)); err != nil {
			respondError(c, http.StatusUnauthorized, "Invalid password")
			return
		}

		hashBytes, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Cannot create hash from password")
			return
		}
		hashedPassword := string(hashBytes)

		if err := repoMgr.UpdateUserPassword(username, hashedPassword); err != nil {
			respondError(c, http.StatusForbidden, err.Error())
		} else {
			respondSuccess(c, http.StatusOK, gin.H{"status": "ok"}, "Password changed!")
		}
	}
}
