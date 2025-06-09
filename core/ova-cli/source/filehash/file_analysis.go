package filehash

// CheckDuplicate returns a map of hashes to paths for files that have duplicates (same hash)
func CheckDuplicate(files []FileInfo) map[string][]string {
	hashToPaths := make(map[string][]string)
	duplicates := make(map[string][]string)

	for _, f := range files {
		hashToPaths[f.Hash] = append(hashToPaths[f.Hash], f.Path)
	}
	for hash, paths := range hashToPaths {
		if len(paths) > 1 {
			duplicates[hash] = paths
		}
	}
	return duplicates
}

// CheckMoving returns files that have the same hash but different paths between old and new lists
func CheckMoving(oldFiles, newFiles []FileInfo) map[string][2]string {
	oldHashPaths := make(map[string][]string)
	for _, f := range oldFiles {
		oldHashPaths[f.Hash] = append(oldHashPaths[f.Hash], f.Path)
	}

	moves := make(map[string][2]string) // hash -> [oldPath, newPath]

	for _, nf := range newFiles {
		oldPaths, exists := oldHashPaths[nf.Hash]
		if !exists {
			continue
		}
		moved := true
		for _, op := range oldPaths {
			if op == nf.Path {
				moved = false
				break
			}
		}
		if moved {
			moves[nf.Hash] = [2]string{oldPaths[0], nf.Path}
		}
	}
	return moves
}

// CheckRemove returns paths that existed before but are missing now (by path)
func CheckRemove(oldFiles, newFiles []FileInfo) []string {
	newPaths := make(map[string]bool)
	for _, f := range newFiles {
		newPaths[f.Path] = true
	}

	var removed []string
	for _, of := range oldFiles {
		if !newPaths[of.Path] {
			removed = append(removed, of.Path)
		}
	}
	return removed
}
