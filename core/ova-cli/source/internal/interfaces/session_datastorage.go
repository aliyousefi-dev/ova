package interfaces

type SessionDataStorage interface {
	AddSession(sessionID string, username string) error
	GetSession(sessionID string) (string, error)
	DeleteSession(sessionID string) error
	SaveOnDisk() error
	LoadFromDisk() error
	ClearAllSessions() error
}