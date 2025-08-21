package datatypes

import "time"

type SpaceSettings struct {
	MaxDiskLimit string `json:"maxDiskLimit"`
	IsPrivate    bool   `json:"isPrivate"`
}

type SpaceGroup struct {
	GroupName string   `json:"groupName"`
	VideoIds  []string `json:"videoIds"`
}

type SpaceData struct {
	SpaceName     string        `json:"spaceName"`
	SpaceOwner    string        `json:"spaceOwner"`
	DiskPath      string        `json:"diskPath"`
	SpaceId       string        `json:"spaceId"`
	Groups        []string      `json:"groups"`
	SpaceSettings SpaceSettings `json:"spaceSettings"`
	InviteLink    string        `json:"inviteLink"`
	MemberIds     []string      `json:"membersIds"`
	CreatedAt     time.Time     `json:"createdAt"`
}

// CreateDefaultSpaceData returns an initialized SpaceData struct for a new space.
func CreateDefaultSpaceData(spaceName string, owner string) SpaceData {
	return SpaceData{
		SpaceName:  spaceName,
		SpaceOwner: owner,
		SpaceId:    "",         // Placeholder for space ID generation logic
		Groups:     []string{}, // No groups by default
		SpaceSettings: SpaceSettings{
			MaxDiskLimit: "100GB", // Default disk limit
			IsPrivate:    true,    // Default privacy setting
		},
		InviteLink: "",
		MemberIds:  []string{owner},  // Owner is the first member
		CreatedAt:  time.Now().UTC(), // Placeholder for current time logic
	}
}
