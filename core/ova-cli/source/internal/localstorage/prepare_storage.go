package localstorage

import "os"

// PrepareStorage ensures all necessary folders and files exist
func (s *LocalStorage) PrepareStorage() error {
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

func (s *LocalStorage) createEmptyJSONFileIfMissing(filePath string) error {
	_, err := os.Stat(filePath)
	if os.IsNotExist(err) {
		f, err := os.Create(filePath)
		if err != nil {
			return err
		}
		defer f.Close()

		// Write empty JSON object
		_, err = f.Write([]byte("{}"))
		if err != nil {
			return err
		}
	} else if err != nil {
		return err
	}
	return nil
}
