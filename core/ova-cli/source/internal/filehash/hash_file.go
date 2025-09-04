package filehash

import (
	"crypto/sha256"
	"encoding/hex"
	"io"
	"os"
)

// Using SHA-256
func ComputeFileHash(filePath string) (string, error) {
	const chunkSize = 5 * 1024 * 1024 // 5MB

	f, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer f.Close()

	stat, err := f.Stat()
	if err != nil {
		return "", err
	}

	hasher := sha256.New()

	// Read first chunkSize bytes
	if _, err := io.CopyN(hasher, f, chunkSize); err != nil && err != io.EOF {
		return "", err
	}

	// If file is bigger than 2 * chunkSize, read last chunkSize bytes
	if stat.Size() > 2*chunkSize {
		_, err := f.Seek(stat.Size()-chunkSize, io.SeekStart)
		if err != nil {
			return "", err
		}
		if _, err := io.CopyN(hasher, f, chunkSize); err != nil && err != io.EOF {
			return "", err
		}
	} else if stat.Size() > chunkSize {
		// If file is between chunkSize and 2*chunkSize, read the remaining bytes after first chunk
		if _, err := io.Copy(hasher, f); err != nil {
			return "", err
		}
	}

	return hex.EncodeToString(hasher.Sum(nil)), nil
}
