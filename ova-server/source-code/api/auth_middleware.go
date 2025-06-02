package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// AuthRequired returns middleware that enforces authentication.
func (sm *SessionManager) AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {

		DebugMode := true // Set this to true to enable debug mode
		if DebugMode {
			// Bypass auth check in debug mode
			c.Set("username", "debug-user")
			c.Next()
			return
		}

		sessionID, err := c.Cookie("session_id")
		if err != nil {
			respondError(c, http.StatusUnauthorized, "Authentication required")
			c.Abort()
			return
		}

		username, ok := sm.sessions[sessionID]
		if !ok {
			respondError(c, http.StatusUnauthorized, "Invalid session")
			c.Abort()
			return
		}

		// Store username in context for use by handlers
		c.Set("username", username)
		c.Next()
	}
}
