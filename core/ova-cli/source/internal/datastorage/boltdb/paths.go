package boltdb

import "path/filepath"

func (b *BoltDB) getDBFilePath() string {
	return filepath.Join(b.storageDir, "bolt.db")
}

func (b *BoltDB) getUsersBucketName() string {
	return "users"
}

func (b *BoltDB) getVideosBucketName() string {
	return "videos"
}
