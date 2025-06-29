package boltdb

import "fmt"

func (b *BoltDB) UpdateUserPassword(username, newHashedPassword string) error {
	users, err := b.loadUsers()
	if err != nil {
		return fmt.Errorf("failed to load users: %w", err)
	}

	user, exists := users[username]
	if !exists {
		return fmt.Errorf("user %q not found", username)
	}

	user.PasswordHash = newHashedPassword
	users[username] = user

	return b.saveUsers(users)
}
