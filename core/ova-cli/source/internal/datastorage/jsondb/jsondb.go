package jsondb

import (
	"ova-cli/source/internal/interfaces"
	"sync"
)

type JsonDB struct {
	mu         sync.Mutex
	storageDir string
}

func NewJsonDB(storageDir string) *JsonDB {
	return &JsonDB{storageDir: storageDir}
}

var _ interfaces.DiskDataStorage = (*JsonDB)(nil)
