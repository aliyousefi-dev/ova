package repo

func (r *RepoManager) AddSession(sessionID string, username string) error {
	return r.sessionDataStorage.AddSession(sessionID, username)
}

func (r *RepoManager) GetUsernameBySession(sessionID string) (string, error) {
	return r.sessionDataStorage.GetSession(sessionID)
}

func (r *RepoManager) DeleteSession(sessionID string) error {
	return r.sessionDataStorage.DeleteSession(sessionID)
}

func (r *RepoManager) SaveUserSessionOnDisk() error {
	return r.sessionDataStorage.SaveOnDisk()
}

func (r *RepoManager) LoadUserSessionsFromDisk() error {
	return r.sessionDataStorage.LoadFromDisk()
}

func (r *RepoManager) ClearAllSessions() error {
	return r.sessionDataStorage.ClearAllSessions()
}
