package datatypes

type SpaceData struct {
	Name             string      `json:"name"`
	Owner            string      `json:"owner"`
	Visibility       bool        `json:"visibility"`
	ChildSpaces      []SpaceData `json:"childSpaces"`
	InviteLink       string      `json:"inviteLink"`
	DiskSizeLimit    int64       `json:"diskSizeLimit"`
	TotalVideos      int64       `json:"totalVideos"`
	CurrentDiskUsage int64       `json:"currentDiskUsage"`
	VideoLimit       int64       `json:"videoLimit"`
	MaxChildSpaces   int64       `json:"maxChildSpaces"`
	CreatedAt        string      `json:"createdAt"`
	CreatedBy        string      `json:"createdBy"`
	Users            []string    `json:"users"`
	Spectors         []string    `json:"spectors"`
}
