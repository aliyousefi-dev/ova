package repo

// CreateUser creates a new user with a hashed password and an optional role.
func (r *RepoManager) GetRootUsername() string {

	// return the root username
	return r.configs.RootUser
}
