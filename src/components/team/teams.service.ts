import { supabase } from "../../lib/supabase";
import type {
  AddTeamMemberInput,
  CreateTeamInput,
  Team,
  TeamMember,
  TeamMemberProfile,
  TeamUserRole,
  UpdateTeamMemberRoleInput,
} from "./team.types";

type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  role: TeamUserRole;
  avatar_color: string | null;
};

type TeamRow = {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type TeamMemberRow = {
  team_id: string;
  user_id: string;
  role: TeamUserRole;
  joined_at: string;
};

function mapProfile(
  profile: ProfileRow,
): TeamMemberProfile {
  return {
    id: profile.id,
    fullName: profile.full_name,
    email: profile.email,
    role: profile.role,
    avatarColor:
      profile.avatar_color ?? "blue",
  };
}

async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(
      `Unable to verify the current user: ${error.message}`,
    );
  }

  if (!user) {
    throw new Error(
      "You must be signed in to manage teams.",
    );
  }

  return user.id;
}

export async function getAvailableProfiles(): Promise<
  TeamMemberProfile[]
> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
        id,
        full_name,
        email,
        role,
        avatar_color
      `,
    )
    .order("full_name", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Unable to load members: ${error.message}`,
    );
  }

  return ((data ?? []) as ProfileRow[]).map(
    mapProfile,
  );
}

export async function getTeams(): Promise<
  Team[]
> {
  const {
    data: teamsData,
    error: teamsError,
  } = await supabase
    .from("teams")
    .select(
      `
        id,
        name,
        description,
        created_by,
        created_at,
        updated_at
      `,
    )
    .order("created_at", {
      ascending: false,
    });

  if (teamsError) {
    throw new Error(
      `Unable to load teams: ${teamsError.message}`,
    );
  }

  const teams =
    (teamsData ?? []) as TeamRow[];

  if (teams.length === 0) {
    return [];
  }

  const teamIds = teams.map(
    (team) => team.id,
  );

  const {
    data: membershipData,
    error: membershipError,
  } = await supabase
    .from("team_members")
    .select(
      `
        team_id,
        user_id,
        role,
        joined_at
      `,
    )
    .in("team_id", teamIds)
    .order("joined_at", {
      ascending: true,
    });

  if (membershipError) {
    throw new Error(
      `Unable to load team memberships: ${membershipError.message}`,
    );
  }

  const memberships =
    (membershipData ??
      []) as TeamMemberRow[];

  const profileIds = Array.from(
    new Set(
      memberships.map(
        (membership) =>
          membership.user_id,
      ),
    ),
  );

  let profiles: ProfileRow[] = [];

  if (profileIds.length > 0) {
    const {
      data: profileData,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select(
        `
          id,
          full_name,
          email,
          role,
          avatar_color
        `,
      )
      .in("id", profileIds);

    if (profileError) {
      throw new Error(
        `Unable to load team member profiles: ${profileError.message}`,
      );
    }

    profiles =
      (profileData ?? []) as ProfileRow[];
  }

  const profileMap = new Map(
    profiles.map((profile) => [
      profile.id,
      profile,
    ]),
  );

  return teams.map((team) => {
    const members = memberships
      .filter(
        (membership) =>
          membership.team_id === team.id,
      )
      .map((membership) => {
        const profile = profileMap.get(
          membership.user_id,
        );

        if (!profile) {
          return null;
        }

        const member: TeamMember = {
          teamId: membership.team_id,
          userId: membership.user_id,
          role: membership.role,
          joinedAt:
            membership.joined_at,
          profile: mapProfile(profile),
        };

        return member;
      })
      .filter(
        (
          member,
        ): member is TeamMember =>
          member !== null,
      );

    return {
      id: team.id,
      name: team.name,
      description:
        team.description ?? "",
      createdBy: team.created_by,
      createdAt: team.created_at,
      updatedAt: team.updated_at,
      members,
    };
  });
}

export async function getTeamById(
  teamId: string,
): Promise<Team> {
  const teams = await getTeams();

  const team = teams.find(
    (currentTeam) =>
      currentTeam.id === teamId,
  );

  if (!team) {
    throw new Error(
      "The requested team could not be found.",
    );
  }

  return team;
}

export async function getProfilesNotInTeam(
  teamId: string,
): Promise<TeamMemberProfile[]> {
  const [
    profiles,
    team,
  ] = await Promise.all([
    getAvailableProfiles(),
    getTeamById(teamId),
  ]);

  const existingMemberIds = new Set(
    team.members.map(
      (member) => member.userId,
    ),
  );

  return profiles.filter(
    (profile) =>
      !existingMemberIds.has(profile.id),
  );
}

export async function createTeam({
  name,
  description,
  memberIds,
}: CreateTeamInput): Promise<void> {
  const currentUserId =
    await getCurrentUserId();

  const cleanedName = name.trim();
  const cleanedDescription =
    description.trim();

  if (cleanedName.length < 2) {
    throw new Error(
      "Team name must contain at least 2 characters.",
    );
  }

  const {
    data: createdTeam,
    error: teamError,
  } = await supabase
    .from("teams")
    .insert({
      name: cleanedName,
      description: cleanedDescription,
      created_by: currentUserId,
    })
    .select("id")
    .single();

  if (teamError) {
    throw new Error(
      `Unable to create team: ${teamError.message}`,
    );
  }

  const uniqueMemberIds = Array.from(
    new Set(memberIds),
  ).filter(
    (userId) =>
      userId !== currentUserId,
  );

  const memberships = [
    {
      team_id: createdTeam.id,
      user_id: currentUserId,
      role:
        "supervisor" satisfies TeamUserRole,
      added_by: currentUserId,
    },
    ...uniqueMemberIds.map(
      (userId) => ({
        team_id: createdTeam.id,
        user_id: userId,
        role:
          "member" satisfies TeamUserRole,
        added_by: currentUserId,
      }),
    ),
  ];

  const { error: membershipError } =
    await supabase
      .from("team_members")
      .insert(memberships);

  if (membershipError) {
    await supabase
      .from("teams")
      .delete()
      .eq("id", createdTeam.id);

    throw new Error(
      `The team was created, but its members could not be added: ${membershipError.message}`,
    );
  }
}

export async function addTeamMember({
  teamId,
  userId,
  role,
}: AddTeamMemberInput): Promise<void> {
  const currentUserId =
    await getCurrentUserId();

  const { error } = await supabase
    .from("team_members")
    .insert({
      team_id: teamId,
      user_id: userId,
      role,
      added_by: currentUserId,
    });

  if (error) {
    if (
      error.code === "23505"
    ) {
      throw new Error(
        "This user is already a member of the team.",
      );
    }

    throw new Error(
      `Unable to add the member: ${error.message}`,
    );
  }
}

export async function removeTeamMember(
  teamId: string,
  userId: string,
): Promise<void> {
  const currentUserId =
    await getCurrentUserId();

  if (userId === currentUserId) {
    throw new Error(
      "You cannot remove yourself from a team you are currently managing.",
    );
  }

  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(
      `Unable to remove the member: ${error.message}`,
    );
  }
}

export async function updateTeamMemberRole({
  teamId,
  userId,
  role,
}: UpdateTeamMemberRoleInput): Promise<void> {
  const { error } = await supabase
    .from("team_members")
    .update({
      role,
    })
    .eq("team_id", teamId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(
      `Unable to update the member's role: ${error.message}`,
    );
  }
}

export async function deleteTeam(
  teamId: string,
): Promise<void> {
  const { error } = await supabase
    .from("teams")
    .delete()
    .eq("id", teamId);

  if (error) {
    throw new Error(
      `Unable to delete the team: ${error.message}`,
    );
  }
}