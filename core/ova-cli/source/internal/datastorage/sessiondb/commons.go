package sessiondb

import "fmt"

// AddSession adds a session ID and username to the SessionDB.
func (db *SessionDB) AddSession(sessionID string, username string) error {
	db.mu.Lock()
	defer db.mu.Unlock()
	if db.SessionIDs == nil {
		db.SessionIDs = make(map[string]string)
	}
	db.SessionIDs[sessionID] = username
	return nil
}

// GetSession retrieves the username for a given session ID.
func (db *SessionDB) GetSession(sessionID string) (string, error) {
	db.mu.RLock()
	defer db.mu.RUnlock()
	if db.SessionIDs == nil {
		return "", fmt.Errorf("no sessions available")
	}
	user, ok := db.SessionIDs[sessionID]
	if !ok {
		return "", fmt.Errorf("session not found")
	}
	return user, nil
}

// DeleteSession removes a session by its ID.
func (db *SessionDB) DeleteSession(sessionID string) error {
	db.mu.Lock()
	defer db.mu.Unlock()
	if db.SessionIDs == nil {
		return fmt.Errorf("no sessions available")
	}
	if _, ok := db.SessionIDs[sessionID]; !ok {
		return fmt.Errorf("session not found")
	}
	delete(db.SessionIDs, sessionID)
	return nil
}


// ClearAllSessions removes all sessions from the database.
func (db *SessionDB) ClearAllSessions() error {
	db.mu.Lock()
	defer db.mu.Unlock()
	db.SessionIDs = make(map[string]string)
	return nil
}