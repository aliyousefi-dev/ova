package repo

import "ova-cli/source/internal/datatypes"

// GetGroupsInSpace returns all groups within the specified space.
func (r *RepoManager) GetGroupsInSpace(spaceId string) []datatypes.SpaceGroup {
	return nil
}

// CreateGroupInSpace creates a new group within a specified space.
func (r *RepoManager) CreateGroupInSpace(spaceId string, groupName string) {
	// return all existing spaces
}

// RemoveGroupFromSpace removes a group from a specified space.
func (r *RepoManager) RemoveGroupFromSpace(spaceId string, groupName string) error {
	// logic to remove the group from the space
	// return an error if the operation fails
	return nil
}
