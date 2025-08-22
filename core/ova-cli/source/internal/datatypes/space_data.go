package datatypes

import "time"

type SpaceSettings struct {
	MaxDiskLimit string `json:"maxDiskLimit"`
	IsPrivate    bool   `json:"isPrivate"`
}

type QualityControl struct {
	Enabled          bool     `json:"enabled"`
	DraftVideoIds    []string `json:"draftVideoIds"`
	AcceptedVideoIds []string `json:"acceptedVideoIds"`
}

type SpaceGroup struct {
	GroupName      string         `json:"groupName"`
	SubGroups      []SpaceGroup   `json:"subGroups"`
	VideoIds       []string       `json:"videoIds"`
	QualityControl QualityControl `json:"qualityControl"`
}

type SpaceData struct {
	SpaceName     string        `json:"spaceName"`
	SpaceOwner    string        `json:"spaceOwner"`
	SpaceId       string        `json:"spaceId"`
	Groups        []SpaceGroup  `json:"groups"`
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
		SpaceId:    "", // Placeholder for space ID generation logic
		Groups: []SpaceGroup{{
			GroupName: "root",
			VideoIds:  []string{},
			QualityControl: QualityControl{
				Enabled:          false,
				DraftVideoIds:    []string{},
				AcceptedVideoIds: []string{}},
		}}, // No groups by default
		SpaceSettings: SpaceSettings{
			MaxDiskLimit: "100GB", // Default disk limit
			IsPrivate:    true,    // Default privacy setting
		},
		InviteLink: "",
		MemberIds:  []string{owner},  // Owner is the first member
		CreatedAt:  time.Now().UTC(), // Placeholder for current time logic
	}
}
