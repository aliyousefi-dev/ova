package repo

import (
	"fmt"
	"ova-cli/source/internal/datastorage"
	"ova-cli/source/internal/datatypes"
	"ova-cli/source/internal/interfaces"
)

// RepoManager handles video registration, thumbnails, previews, etc.
type RepoManager struct {
	rootDir     string
	configs     datatypes.Config
	AuthEnabled bool
	diskDataStorage interfaces.DiskDataStorage
	memoryDataStorage interfaces.MemoryDataStorage
	sessionDataStorage interfaces.SessionDataStorage
}

// NewRepoManager creates a new instance of RepoManager and initializes data storage.
func NewRepoManager(rootDir string) (*RepoManager, error) {
	r := &RepoManager{
		rootDir: rootDir,
		AuthEnabled: true,
	}

	// Initialize the repository, which includes creating the folder, loading the config, and initializing data storage
	if err := r.InitDataStorage(); err != nil {
		return nil, fmt.Errorf("failed to initialize repository: %w", err)
	}

	// Fire initialization event
	r.OnInit()

	return r, nil
}

// InitDataStorage initializes the repository manager by loading the configuration file,
// creating a default config if it doesn't exist, and initializing the data storage backend.
func (r *RepoManager) InitDataStorage() error {
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

	var err error
	r.diskDataStorage, err = datastorage.NewDiskStorage(storageType, storagePath)
	if err != nil {
		return fmt.Errorf("failed to initialize data storage (%s): %w", storageType, err)
	}

	r.memoryDataStorage, err = datastorage.NewMemoryStorage()
	if err != nil {
		return fmt.Errorf("failed to initialize memory storage: %w", err)
	}

	r.sessionDataStorage, err = datastorage.NewSessionStorage(storagePath)
	if err != nil {
		return fmt.Errorf("failed to initialize session storage: %w", err)
	}

	return nil
}
