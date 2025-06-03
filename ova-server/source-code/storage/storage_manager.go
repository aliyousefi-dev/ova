package storage

type StorageManager struct {
	Users  *UserStore
	Videos *VideoStore
}

// NewStorageManager initializes all storages with the same metadata directory
func NewStorageManager(storageDir string) *StorageManager {
	return &StorageManager{
		Users:  newUserStore(storageDir),
		Videos: newVideoStore(storageDir),
	}
}
