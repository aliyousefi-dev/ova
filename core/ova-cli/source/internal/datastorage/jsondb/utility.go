package jsondb

import (
	"os"
	"path/filepath"
)

func (s *JsonDB) createEmptyJSONFileIfMissing(filePath string) error {
	_, err := os.Stat(filePath)
	if os.IsNotExist(err) {
		// Ensure the parent directory exists
		dir := filepath.Dir(filePath)
		if err := os.MkdirAll(dir, 0755); err != nil {
			return err
		}

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
