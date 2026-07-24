export type TeamUserRole =
  | "member"
  | "supervisor";

export type TeamMemberProfile = {
  id: string;
  fullName: string;
  email: string;
  role: TeamUserRole;
  avatarColor: string;
};

export type TeamMember = {
  teamId: string;
  userId: string;
  joinedAt: string;
  profile: TeamMemberProfile;
};

export type Team = {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  members: TeamMember[];
};

export type CreateTeamInput = {
  name: string;
  description: string;
  memberIds: string[];
};