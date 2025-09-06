package filehash

import (
	"encoding/hex"
	"io"
	"os"

	"github.com/zeebo/xxh3" // Import the BLAKE3 package
)

// Using BLAKE3 (instead of BLAKE2b)
func Blake2bFileHash(filePath string) (string, error) {
	const chunkSize = 5 * 1024 * 1024 // 5MB

	// Open the file
	f, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer f.Close()

	// Get file stats
	stat, err := f.Stat()
	if err != nil {
		return "", err
	}

	// Initialize the BLAKE3 hasher
	hasher := xxh3.New()

	// Read the first chunkSize bytes
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

	// Return the hash as a hexadecimal string
	return hex.EncodeToString(hasher.Sum(nil)), nil
}
