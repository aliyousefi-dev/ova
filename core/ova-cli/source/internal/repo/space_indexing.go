package repo

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
)

func (r *RepoManager) ScanAndAddAllSpaces() error {
	// 1. Scan the disk to get a slice of SpaceScan structs.
	// This function is assumed to exist and return the data you provided.
	spaces, err := r.ScanDiskForSpaces()
	if err != nil {
		fmt.Printf("Failed to scan for spaces: %v\n", err)
		return err
	}

	// 2. Iterate through each SpaceScan and convert it to a SpaceData struct.
	for _, spaceScan := range spaces {
		// Use the space name from the scan and the root username for the owner.
		spaceData := r.convertSpaceScanToSpaceData(spaceScan, r.GetRootUsername())

		error := r.CreateSpace(spaceData)
		if error != nil {
			fmt.Printf("Failed to create space %s: %v\n", spaceData.SpaceName, error)
			continue
		}

		// Print a confirmation message for each space processed.
		fmt.Printf("Successfully converted and processed space: %s\n", spaceData.SpaceName)
	}

	return nil
}

// convertSpaceScanToSpaceData converts a SpaceScan struct to a SpaceData struct.
// It recursively calls a helper to convert nested groups.
func (r *RepoManager) convertSpaceScanToSpaceData(spaceScan SpaceScan, owner string) datatypes.SpaceData {
	// Create the base SpaceData struct with default values.
	spaceData := datatypes.CreateDefaultSpaceData(spaceScan.Space, owner)

	// Convert all nested GroupScan structs into SpaceGroup structs.
	for _, groupScan := range spaceScan.Groups {
		convertedGroup := r.convertGroupScanToSpaceGroup(groupScan)
		spaceData.Groups = append(spaceData.Groups, convertedGroup)
	}

	return spaceData
}

// convertGroupScanToSpaceGroup recursively converts a GroupScan struct
// and its nested subgroups into a SpaceGroup struct.
func (r *RepoManager) convertGroupScanToSpaceGroup(groupScan GroupScan) datatypes.SpaceGroup {
	// Create the base SpaceGroup struct.
	spaceGroup := datatypes.SpaceGroup{
		GroupName: groupScan.GroupName,
		// The files from GroupScan become the VideoIds in the SpaceGroup.
		QualityControl: datatypes.QualityControl{
			Enabled:          false, // Default value
			DraftVideoIds:    []string{},
			AcceptedVideoIds: []string{},
		},
	}

	// Recursively call this function for each nested subgroup.
	for _, subGroupScan := range groupScan.Groups {
		subGroup := r.convertGroupScanToSpaceGroup(subGroupScan)
		spaceGroup.Groups = append(spaceGroup.Groups, subGroup)
	}

	return spaceGroup
}
func (r *RepoManager) IndexMultiSpaces(spacePaths []string) {

}
