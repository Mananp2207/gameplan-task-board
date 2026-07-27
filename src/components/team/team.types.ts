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

  // This is the user’s role inside this specific team.
  role: TeamUserRole;

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

export type AddTeamMemberInput = {
  teamId: string;
  userId: string;
  role: TeamUserRole;
};

export type UpdateTeamMemberRoleInput = {
  teamId: string;
  userId: string;
  role: TeamUserRole;
};