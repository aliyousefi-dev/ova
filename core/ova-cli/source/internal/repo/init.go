package repo

import (
	"fmt"
	"ova-cli/source/internal/datastorage"
)

// Init initializes the repository manager by loading the configuration file,
// creating a default config if it doesn't exist, and initializing the data storage backend.
func (r *RepoManager) Init() error {
	// Ensure the repository folder exists
	if err := r.CreateRepoFolder(); err != nil {
		return fmt.Errorf("failed to ensure repo folder: %w", err)
	}

	// Attempt to load config (creates default if not present)
	if err := r.LoadRepoConfig(); err != nil {
		return fmt.Errorf("failed to initialize repo config: %w", err)
	}

	// Load data storage backend
	storageType := r.configs.DataStorageType
	storagePath := r.GetStoragePath()

	storage, err := datastorage.NewStorage(storageType, storagePath)
	if err != nil {
		return fmt.Errorf("failed to initialize data storage (%s): %w", storageType, err)
	}

	r.dataStorage = storage
	return nil
}
