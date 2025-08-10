package sessiondb

import (
	"encoding/json"
	"os"
)

// SaveOnDisk saves the session data to disk as JSON.
func (db *SessionDB) SaveOnDisk() error {
	db.mu.RLock()
	defer db.mu.RUnlock()
	path := db.getSessionDataFilePath()
	f, err := os.Create(path)
	if err != nil {
		return err
	}
	defer f.Close()
	enc := json.NewEncoder(f)
	enc.SetIndent("", "  ")
	return enc.Encode(db.SessionIDs)
}

// LoadFromDisk loads the session data from disk (JSON).
func (db *SessionDB) LoadFromDisk() error {
	db.mu.Lock()
	defer db.mu.Unlock()
	path := db.getSessionDataFilePath()
	f, err := os.Open(path)
	if err != nil {
		if os.IsNotExist(err) {
			// File does not exist, create it with an empty map
			db.SessionIDs = make(map[string]string)
			// Save the empty map to disk
			if createErr := db.SaveOnDisk(); createErr != nil {
				return createErr
			}
			return nil
		}
		return err
	}
	defer f.Close()
	dec := json.NewDecoder(f)
	m := make(map[string]string)
	if err := dec.Decode(&m); err != nil {
		return err
	}
	db.SessionIDs = m
	return nil
}
