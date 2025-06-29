package repo

import (
	"fmt"
	"ova-cli/source/internal/datatypes"

	"golang.org/x/crypto/bcrypt"
)

// CreateUser creates a new user with hashed password and optional admin role.
func (r *RepoManager) CreateUser(username, password string, isAdmin bool) error {
	if !r.IsDataStorageExists() {
		return fmt.Errorf("data storage is not initialized")
	}

	// Hash password
	hashedPass, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// Prepare user data
	userdata := datatypes.NewUserData(username, string(hashedPass))
	if isAdmin {
		userdata.Roles = append(userdata.Roles, "admin")
	}

	// Store user
	if err := r.dataStorage.CreateUser(&userdata); err != nil {
		return fmt.Errorf("failed to create user in data storage: %w", err)
	}
	return nil
}

// DeleteUser removes a user by username.
func (r *RepoManager) DeleteUser(username string) error {
	if !r.IsDataStorageExists() {
		return fmt.Errorf("data storage is not initialized")
	}
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
