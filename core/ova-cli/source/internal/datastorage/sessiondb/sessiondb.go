package sessiondb

import (
	"ova-cli/source/internal/interfaces"
	"sync"
)

type SessionDB struct {

	// session id -> username
	SessionIDs map[string]string
	storageDir string

	mu sync.RWMutex
}

func NewSessionDB(storageDir string) *SessionDB {
	return &SessionDB{
		SessionIDs: make(map[string]string),
		storageDir: storageDir,
	}
}

var _ interfaces.SessionDataStorage = (*SessionDB)(nil)

