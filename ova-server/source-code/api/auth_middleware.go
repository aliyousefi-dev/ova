package api

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(sm *SessionManager, publicPaths map[string]bool, publicPrefixes []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if sm.DisableAuth {
			fmt.Println("[AuthMiddleware] Auth disabled: skipping all auth checks")
			// Skip all authentication checks
			c.Next()
			return
		}

		path := c.Request.URL.Path

		if publicPaths[path] {
			c.Next()
			return
		}

		for _, prefix := range publicPrefixes {
			if strings.HasPrefix(path, prefix) {
				c.Next()
				return
			}
		}

		// Auth check
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

		c.Set("username", username)
		c.Next()
	}
}
