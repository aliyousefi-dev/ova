package storage

type StorageManager struct {
	Playlists *PlaylistStore
	Users     *UserStore
	Videos    *VideoStore
}

// NewStorageManager initializes all storages with the same metadata directory
func NewStorageManager(storageDir string) *StorageManager {
	return &StorageManager{
		Playlists: newPlaylistStorage(storageDir),
		Users:     newUserStore(storageDir),
		Videos:    newVideoStore(storageDir),
	}
}
