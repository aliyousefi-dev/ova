package repo

import "ova-cli/source/internal/interfaces"

func (r *RepoManager) InitWithUser(username, password string) error {
	// Check if repo exists (no error means exists)
	err := r.IsRepoExists()
	if err != nil {
		// Repo doesn't exist, create folder and config
		if err := r.CreateRepoFolder(); err != nil {
			return err
		}
		if err := r.CreateDefaultConfigFile(); err != nil {
			return err
		}
	}

	// Create admin user
	if err := r.CreateUser(username, password, true); err != nil {
		return err
	}

	return nil
}

func (r *RepoManager) SetDataStorage(datastorage interfaces.DataStorage) {
	r.dataStorage = datastorage
}
