package jsondb

import "os"

// PrepareStorage ensures all necessary folders and files exist
func (s *JsonDB) PrepareStorage() error {
	// Create main storage directory if not exists
	if err := os.MkdirAll(s.storageDir, 0755); err != nil {
		return err
	}

	// Create thumbnails and previews folders
	if err := os.MkdirAll(s.getThumbsDir(), 0755); err != nil {
		return err
	}
	if err := os.MkdirAll(s.getPreviewsDir(), 0755); err != nil {
		return err
	}

	// Create users.json if missing with empty JSON object {}
	if err := s.createEmptyJSONFileIfMissing(s.getUserStoragePath()); err != nil {
		return err
	}

	// Create videos.json if missing with empty JSON object {}
	if err := s.createEmptyJSONFileIfMissing(s.getVideoStoragePath()); err != nil {
		return err
	}

	return nil
}
