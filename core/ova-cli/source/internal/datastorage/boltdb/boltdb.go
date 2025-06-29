package boltdb

import (
	"fmt"
	"os"
	"ova-cli/source/internal/interfaces"
	"path/filepath"
	"sync"

	"go.etcd.io/bbolt"
)

type BoltDB struct {
	mu         sync.Mutex
	db         *bbolt.DB
	storageDir string
}

func NewBoltDB(storageDir string) (*BoltDB, error) {
	if err := os.MkdirAll(storageDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create storage directory: %w", err)
	}

	dbPath := filepath.Join(storageDir, "bolt.db")

	db, err := bbolt.Open(dbPath, 0600, nil)
	if err != nil {
		return nil, err
	}

	// Initialize required buckets
	err = db.Update(func(tx *bbolt.Tx) error {
		buckets := []string{"users", "videos", "playlists"}
		for _, b := range buckets {
			_, err := tx.CreateBucketIfNotExists([]byte(b))
			if err != nil {
				return fmt.Errorf("failed to create bucket %q: %w", b, err)
			}
		}
		return nil
	})
	if err != nil {
		db.Close()
		return nil, err
	}

	return &BoltDB{
		db:         db,
		storageDir: storageDir,
	}, nil
}

func (b *BoltDB) Close() error {
	return b.db.Close()
}

var _ interfaces.DataStorage = (*BoltDB)(nil)
