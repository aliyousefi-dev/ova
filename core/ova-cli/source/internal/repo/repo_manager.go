package repo

import (
	"ova-cli/source/internal/datatypes"
	"ova-cli/source/internal/interfaces"
)

// RepoManager handles video registration, thumbnails, previews, etc.
type RepoManager struct {
	rootDir     string
	configs     datatypes.Config
	dataStorage interfaces.DataStorage
}

// NewRepoManager creates a new instance of RepoManager.
func NewRepoManager(rootDir string) *RepoManager {
	return &RepoManager{
		rootDir: rootDir,
	}
}
