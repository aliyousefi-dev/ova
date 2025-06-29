package jsondb

import "path/filepath"

func (s *JsonDB) GetStoragePath() string {
	return s.storageDir
}

func (s *JsonDB) getUserStoragePath() string {
	return filepath.Join(s.storageDir, "users.json")
}

func (s *JsonDB) getVideoStoragePath() string {
	return filepath.Join(s.storageDir, "videos.json")
}

func (s *JsonDB) getThumbsDir() string {
	return filepath.Join(s.storageDir, "thumbnails")
}

func (s *JsonDB) getPreviewsDir() string {
	return filepath.Join(s.storageDir, "previews")
}

func (s *JsonDB) GetVideoMarkerDir() string {
	return filepath.Join(s.storageDir, "video_markers")
}

func (s *JsonDB) getRootRepositoryPath() string {
	return filepath.Dir(filepath.Dir(s.storageDir))
}
