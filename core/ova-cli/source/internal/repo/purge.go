package repo

import (
	"os"
)

func (r *RepoManager) PurgeRepository() error {
	repoDir := r.GetRepoDir()
	if err := os.RemoveAll(repoDir); err != nil {
		return err
	}
	return nil
}
