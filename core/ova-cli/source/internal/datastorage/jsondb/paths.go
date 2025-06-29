package jsondb

import "path/filepath"

func (s *JsonDB) getUserDataFilePath() string {
	return filepath.Join(s.storageDir, "users.json")
}

func (s *JsonDB) getVideoDataFilePath() string {
	return filepath.Join(s.storageDir, "videos.json")
}
