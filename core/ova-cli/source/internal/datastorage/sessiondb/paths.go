package sessiondb

import "path/filepath"

func (s *SessionDB) getSessionDataFilePath() string {
	return filepath.Join(s.storageDir, "sessions.json")
}
