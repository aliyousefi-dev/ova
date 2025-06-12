package storage

import "path/filepath"

type StorageManager struct {
	StorageRoot string
	Users       *UserStore
	Videos      *VideoStore
}

// NewStorageManager initializes all storages with the same metadata directory
func NewStorageManager(storageDir string) *StorageManager {
	return &StorageManager{
		StorageRoot: storageDir,
		Users:       newUserStore(storageDir),
		Videos:      newVideoStore(storageDir),
	}
}

// UserStoragePath returns the path to the users.json metadata file
func (s *StorageManager) UserStoragePath() string {
	return filepath.Join(s.StorageRoot, "users.json")
}

// VideoStoragePath returns the path to the videos.json metadata file
func (s *StorageManager) VideoStoragePath() string {
	return filepath.Join(s.StorageRoot, "videos.json")
}
