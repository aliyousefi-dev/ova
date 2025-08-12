package sessiondb

import (
	"encoding/json"
	"os"
)

// SaveOnDisk saves the session data to disk as JSON.
func (db *SessionDB) SaveOnDisk() error {
	db.mu.Lock()
	defer db.mu.Unlock()
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
	path := db.getSessionDataFilePath()
	f, err := os.Open(path)
	if err != nil {
		if os.IsNotExist(err) {
			db.mu.Lock()
			db.SessionIDs = make(map[string]string)
			db.mu.Unlock()
			// Save the empty map to disk (SaveOnDisk will lock internally)
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
	db.mu.Lock()
	db.SessionIDs = m
	db.mu.Unlock()
	return nil
}
