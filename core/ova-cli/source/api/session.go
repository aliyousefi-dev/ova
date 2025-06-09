package api

// SessionManager manages user sessions.
type SessionManager struct {
	sessions    map[string]string // sessionID -> username
	DisableAuth bool              // disable authentication globally (for testing)
}

// NewSessionManager initializes a new session manager.
func NewSessionManager() *SessionManager {
	return &SessionManager{
		sessions: make(map[string]string),
	}
}
