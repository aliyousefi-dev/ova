package jsondb

import "fmt"

func (s *JsonDB) UpdateUserPassword(username, newHashedPassword string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	users, err := s.loadUsers()
	if err != nil {
		return fmt.Errorf("failed to load users: %w", err)
	}

	user, exists := users[username]
	if !exists {
		return fmt.Errorf("user %q not found", username)
	}

	user.PasswordHash = newHashedPassword

	users[username] = user

	return s.saveUsers(users)

}
