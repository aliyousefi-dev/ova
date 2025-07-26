package repo

import "fmt"

// UpdateUserPassword updates the password hash of a user.
func (r *RepoManager) UpdateUserPassword(username, newHashedPassword string) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.UpdateUserPassword(username, newHashedPassword)
}
