export interface SpaceData {
  owner: string;
  isPrivate: boolean;
  spaceId: string;
  inviteLinks: string[];
  name: string;
  description: string;
  qualityControl: boolean;
  qualityControlMembers: string[];
  members: string[];
  defaultRole: string;
  totalVideos: number;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}
