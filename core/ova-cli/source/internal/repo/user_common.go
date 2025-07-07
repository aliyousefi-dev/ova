package repo

import (
	"fmt"
	"ova-cli/source/internal/datatypes"

	"golang.org/x/crypto/bcrypt"
)

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) CreateUser(username, password, role string) (*datatypes.UserData, error) {
	if !r.IsDataStorageExists() {
		return nil, fmt.Errorf("data storage is not initialized")
	}

	// Hash password
	hashedPass, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Prepare user data
	userdata := datatypes.NewUserData(username, string(hashedPass))
	if role != "" {
		// Add the specified role
		userdata.Roles = append(userdata.Roles, role)
	}

	// Store user
	if err := r.dataStorage.CreateUser(&userdata); err != nil {
		return nil, fmt.Errorf("failed to create user in data storage: %w", err)
	}
	return &userdata, nil
}

// DeleteUser removes a user by username and returns the deleted user data.
func (r *RepoManager) DeleteUser(username string) (*datatypes.UserData, error) {
	if !r.IsDataStorageExists() {
		return nil, fmt.Errorf("data storage is not initialized")
	}

	// Call DeleteUser from the dataStorage and return the deleted user data
	return r.dataStorage.DeleteUser(username)
}

// GetAllUsers retrieves all users from the storage.
func (r *RepoManager) GetAllUsers() ([]datatypes.UserData, error) {
	if !r.IsDataStorageExists() {
		return nil, fmt.Errorf("data storage is not initialized")
	}
	return r.dataStorage.GetAllUsers()
}

// GetUserByUsername retrieves a single user by username.
func (r *RepoManager) GetUserByUsername(username string) (*datatypes.UserData, error) {
	if !r.IsDataStorageExists() {
		return nil, fmt.Errorf("data storage is not initialized")
	}
	return r.dataStorage.GetUserByUsername(username)
}
