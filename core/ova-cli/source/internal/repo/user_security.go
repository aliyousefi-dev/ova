package repo

import "fmt"

// UpdateUserPassword updates the password hash of a user.
func (r *RepoManager) UpdateUserPassword(username, newHashedPassword string) error {
	if !r.IsDataStorageExists() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.dataStorage.UpdateUserPassword(username, newHashedPassword)
}
