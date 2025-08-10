package repo

import "fmt"

// OnInit initializes the repository by caching the latest videos
func (r *RepoManager) OnInit() error {

	if err := r.LoadUserSessionsFromDisk(); err != nil {
		return fmt.Errorf("failed to load user sessions from disk: %w", err)
	}

	fmt.Printf("Successfully initialized repository.\n")

	// Call CacheLatestVideos to load the latest videos into memory storage
	if err := r.CacheLatestVideos(); err != nil {
		return fmt.Errorf("failed to cache latest videos: %w", err)
	}

	// Fetch the total number of videos in the persistent storage
	totalPersistentVideos, err := r.GetTotalVideoCount() // Fetch the total video count from the database
	if err != nil {
		return fmt.Errorf("failed to get total video count: %w", err)
	}
	fmt.Printf("Total videos in persistent storage: %d\n", totalPersistentVideos)

	// Fetch the total number of videos cached in memory
	totalVideos, err := r.GetTotalVideosCached()
	if err != nil {
		return fmt.Errorf("failed to get total cached videos: %w", err)
	}
	fmt.Printf("Total cached videos: %d\n", totalVideos)

	// Fetch all cached video IDs and print the length of the slice
	videoIds, err := r.GetAllCachedVideos()
	if err != nil {
		return fmt.Errorf("failed to get cached video IDs: %w", err)
	}
	fmt.Printf("Total cached video IDs: %d\n", len(videoIds)) // Print the length of cached video IDs

	return nil
}

// OnShutdown gracefully shuts down the repository, ensuring all data is persisted and resources are released.
func (r *RepoManager) OnShutdown() error {
	fmt.Println("Shutting down repository...")

	// Attempt to save all user session data to disk
	if err := r.SaveUserSessionOnDisk(); err != nil {
		fmt.Printf("Warning: failed to save session data: %v\n", err)
	}

	fmt.Println("Repository shut down successfully.")
	return nil
}
