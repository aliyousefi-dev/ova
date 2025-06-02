package filehash

import (
	"log"
	"ova-server/source-code/repository"
)

// FileInfo stores path and hash info
type FileInfo struct {
	Path string
	Hash string
}

// GenerateHashCollection scans a folder for videos and hashes them
func GenerateHashCollection(root string) ([]FileInfo, error) {
	files, err := repository.ScanVideos(root)
	if err != nil {
		return nil, err
	}

	var collection []FileInfo
	for _, file := range files {
		hash, err := ComputeFileHash(file)
		if err != nil {
			log.Printf("Warning: failed to hash %s: %v", file, err)
			continue
		}
		collection = append(collection, FileInfo{Path: file, Hash: hash})
	}

	return collection, nil
}
