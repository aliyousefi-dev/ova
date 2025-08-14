package repo

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
)

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) GetAllSpaces() {
	// return all existing spaces
}

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) CreateSpace(spaceName string, owner string) {
	// create a new space
	r.GetRootPath()
	r.CreateSpaceDirectory(spaceName)
}

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) DeleteSpace(space string) {
	r.DeleteSpaceDirectory(space)
}

func (r *RepoManager) GetSpaceByID(space string) {

}

func (r *RepoManager) GetSpaceSettings(space string) {

}

func (r *RepoManager) UpdateSpaceSettings(space string) {

}

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) AddUserToSpace(user string, space *datatypes.SpaceData) {

}

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) RemoveUserFromSpace(user string, space *datatypes.SpaceData) {

}

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) GetUsersInSpace(space *datatypes.SpaceData) {

}

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) SetSpacePrivacy(space *datatypes.SpaceData) {

}

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) CheckUserInSpace(space *datatypes.SpaceData) {

}

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) AssignRoleToUserInSpace(space *datatypes.SpaceData) {

}

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) RemoveRoleFromUserInSpace(space *datatypes.SpaceData) {

}

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) SpaceExists(spaceID string) {

}

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) IsUserSpaceOwner(spaceID string) {

}

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) GetSpaceUsage(spaceID string) {

}

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) GetTotalVideosOnSpace(spaceID string) {

}

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) TransferSpaceOwnership(space *datatypes.SpaceData, newOwner string) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}

	return nil
}
