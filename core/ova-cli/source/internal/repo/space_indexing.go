package repo

import "fmt"

func (r *RepoManager) ScanAndAddAllSpaces() error {
	// Scan for folders
	folders, err := r.ScanDiskForFolders()
	if err != nil {
		fmt.Printf("Failed to scan for folders: %v\n", err)
		return err
	}

	// Loop through each folder and create a space for it
	for _, folder := range folders {
		// Create a space for each folder with the folder's name as the space name
		err := r.CreateSpace(folder, r.GetRootUsername())
		if err != nil {
			fmt.Printf("Failed to create space for folder %s: %v\n", folder, err)
			continue // Continue with the next folder if one fails
		}

		// Output the space creation confirmation for each folder
		fmt.Printf("Space Created for Folder: %s\n", folder)
	}
	return nil
}

func (r *RepoManager) IndexMultiSpaces(spacePaths []string) {

}
