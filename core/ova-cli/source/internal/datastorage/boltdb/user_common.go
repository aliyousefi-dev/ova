package boltdb

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
)

// CreateUser adds a new user if a user with the same username does not already exist.
// Returns an error if a user with the provided username already exists.
func (b *BoltDB) CreateUser(user *datatypes.UserData) error {
	users, err := b.loadUsers()
	if err != nil {
		return fmt.Errorf("failed to load users: %w", err)
	}

	if _, exists := users[user.Username]; exists {
		return fmt.Errorf("user with username %q already exists", user.Username)
	}

	users[user.Username] = *user // Store a copy of the UserData
	return b.saveUsers(users)
}

// DeleteUser removes a user by their username.
// Returns an error if the user is not found.
func (b *BoltDB) DeleteUser(username string) error {
	users, err := b.loadUsers()
	if err != nil {
		return fmt.Errorf("failed to load users: %w", err)
	}

	if _, exists := users[username]; !exists {
		return fmt.Errorf("user %q not found", username)
	}

	delete(users, username)
	return b.saveUsers(users)
}

// UpdateUser updates an existing user.
// Returns an error if the user does not exist.
func (b *BoltDB) UpdateUser(updatedUser datatypes.UserData) error {
	users, err := b.loadUsers()
	if err != nil {
		return fmt.Errorf("failed to load users: %w", err)
	}

	if _, exists := users[updatedUser.Username]; !exists {
		return fmt.Errorf("user %q not found for update", updatedUser.Username)
	}

	users[updatedUser.Username] = updatedUser // Store the updated value
	return b.saveUsers(users)
}

// GetAllUsers returns all users currently in storage as a slice.
func (b *BoltDB) GetAllUsers() ([]datatypes.UserData, error) {
	usersMap, err := b.loadUsers()
	if err != nil {
		return nil, fmt.Errorf("failed to load users: %w", err)
	}

	var users []datatypes.UserData
	for _, user := range usersMap {
		users = append(users, user)
	}
	return users, nil
}
