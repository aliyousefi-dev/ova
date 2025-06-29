package boltdb

import (
	"encoding/json"
	"fmt"
	"ova-cli/source/internal/datatypes"

	"go.etcd.io/bbolt"
)

func (b *BoltDB) loadUsers() (map[string]datatypes.UserData, error) {
	b.mu.Lock()
	defer b.mu.Unlock()

	users := make(map[string]datatypes.UserData)

	err := b.db.View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(b.getUsersBucketName()))
		if bucket == nil {
			return fmt.Errorf("users bucket not found")
		}
		return bucket.ForEach(func(k, v []byte) error {
			var user datatypes.UserData
			if err := json.Unmarshal(v, &user); err != nil {
				return err
			}
			users[string(k)] = user
			return nil
		})
	})
	return users, err
}

func (b *BoltDB) saveUsers(users map[string]datatypes.UserData) error {
	b.mu.Lock()
	defer b.mu.Unlock()

	return b.db.Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(b.getUsersBucketName()))
		if bucket == nil {
			return fmt.Errorf("users bucket not found")
		}

		for username, user := range users {
			data, err := json.Marshal(&user)
			if err != nil {
				return err
			}
			if err := bucket.Put([]byte(username), data); err != nil {
				return err
			}
		}
		return nil
	})
}

func (b *BoltDB) loadVideos() (map[string]datatypes.VideoData, error) {
	b.mu.Lock()
	defer b.mu.Unlock()

	videos := make(map[string]datatypes.VideoData)

	err := b.db.View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(b.getVideosBucketName()))
		if bucket == nil {
			return fmt.Errorf("videos bucket not found")
		}

		return bucket.ForEach(func(k, v []byte) error {
			var video datatypes.VideoData
			if err := json.Unmarshal(v, &video); err != nil {
				return err
			}
			videos[string(k)] = video
			return nil
		})
	})

	return videos, err
}

func (b *BoltDB) saveVideos(videos map[string]datatypes.VideoData) error {
	b.mu.Lock()
	defer b.mu.Unlock()

	return b.db.Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(b.getVideosBucketName()))
		if bucket == nil {
			return fmt.Errorf("videos bucket not found")
		}

		for id, video := range videos {
			data, err := json.Marshal(&video)
			if err != nil {
				return err
			}

			if err := bucket.Put([]byte(id), data); err != nil {
				return err
			}
		}
		return nil
	})
}
