package localstorage

import (
	"ova-cli/source/internal/interfaces"
	"path/filepath"
	"sync"
)

type LocalStorage struct {
	mu         sync.Mutex
	storageDir string
}

func (s *LocalStorage) GetStoragePath() string {
	return s.storageDir
}

func NewLocalStorage(storageDir string) *LocalStorage {
	return &LocalStorage{storageDir: storageDir}
}

func (s *LocalStorage) getUserStoragePath() string {
	return filepath.Join(s.storageDir, "users.json")
}

func (s *LocalStorage) getVideoStoragePath() string {
	return filepath.Join(s.storageDir, "videos.json")
}

func (s *LocalStorage) getThumbsDir() string {
	return filepath.Join(s.storageDir, "thumbnails")
}

func (s *LocalStorage) getPreviewsDir() string {
	return filepath.Join(s.storageDir, "previews")
}

func (s *LocalStorage) GetVideoChaptersDir() string {
	return filepath.Join(s.storageDir, "chapters_vtt")
}

func (s *LocalStorage) getRootRepositoryPath() string {
	return filepath.Dir(filepath.Dir(s.storageDir))
}

var _ interfaces.StorageService = (*LocalStorage)(nil)
