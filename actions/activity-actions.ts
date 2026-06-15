"use server"

import type { ActivityWithUser } from "@/types/activity";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Helper: fetch user info by ID using admin client
async function getUserById(userId: string) {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.getUserById(userId);
  if (error || !data?.user) return null;
  const u = data.user;
  return {
    id: u.id,
    email: u.email || "",
    name: (u.user_metadata?.name as string) || u.email || "Unknown",
    avatar: (u.user_metadata?.avatar_url as string) || "",
  };
}

export async function fetchCardActivities(cardId: string): Promise<ActivityWithUser[]> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to view activities");
  }
  
  const { data, error } = await supabase
    .from("activities")
    .select(`
      id,
      card_id,
      board_id,
      user_id,
      action_type,
      data,
      created_at
    `)
    .eq("card_id", cardId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching activities:", error);
    return [];
  }

  if (!data || data.length === 0) return [];

  // Batch-fetch unique users to avoid N+1 queries
  const uniqueUserIds = [...new Set(data.map((a) => a.user_id))];
  const userMap = new Map<string, { id: string; email: string; name: string; avatar: string }>();

  await Promise.all(
    uniqueUserIds.map(async (uid) => {
      const userInfo = await getUserById(uid);
      if (userInfo) userMap.set(uid, userInfo);
    })
  );

  const activitiesWithUser: ActivityWithUser[] = data.map((activity) => ({
    ...activity,
    user: userMap.get(activity.user_id) ?? {
      id: activity.user_id,
      email: "Unknown",
      name: "Unknown",
      avatar: "",
    },
  }));

  return activitiesWithUser;
}

export async function addCardActivity(
  cardId: string,
  boardId: string,
  actionType: ActivityWithUser["action_type"],
  data: Record<string, unknown>
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  console.log("board id in action:", boardId);

  if (authError || !user) {
    throw new Error("You must be logged in to add an activity");
  }
  
  const { error, data: resData } = await supabase.from("activities").insert({
    card_id: cardId,
    board_id: boardId,
    user_id: user.id,
    action_type: actionType,
    data: data,
  }).select().single();
  
  if (error) {
    console.error("Error adding activity:", error);
    throw new Error("Failed to add activity");
  }

  // Use the current user's own info (they are the one adding the activity)
  const activityWithUser: ActivityWithUser = {
    ...resData,
    user: {
      id: user.id,
      email: user.email || "",
      name: (user.user_metadata?.name as string) || user.email || "Unknown",
      avatar: (user.user_metadata?.avatar_url as string) || "",
    },
  };

  return { success: true, data: activityWithUser };
}

export const fetchActivityDetail = async (activityId: string) => {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to view an activity");
  }

  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("id", activityId)
    .single();

  if (error) {
    console.error("Error fetching activity detail:", error);
    return null;
  }

  // Fetch the actual owner of this activity
  const activityUser = await getUserById(data.user_id);

  console.log("Fetched activity detail:", data);
  return {
    ...data,
    user: activityUser ?? {
      id: data.user_id,
      email: "Unknown",
      name: "Unknown",
      avatar: "",
    },
  };
}

export const updateActivity = async (
  activityId: string,
  updateData: Partial<Omit<ActivityWithUser, "id" | "user">>
) => {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to update an activity");
  }
  const { error, data } = await supabase
    .from("activities")
    .update(updateData)
    .eq("id", activityId)
    .select()
    .single();

  if (error) {
    console.error("Error updating activity:", error);
    return { success: false, error: "Failed to update activity" };
  }

  // Fetch the actual owner of this activity
  const activityUser = await getUserById(data.user_id);

  return { success: true, data: {
    ...data,
    user: activityUser ?? {
      id: data.user_id,
      email: "Unknown",
      name: "Unknown",
      avatar: "",
    },
  } as ActivityWithUser };
}

export const deleteActivity = async (activityId: string) => {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("You must be logged in to delete an activity");
  }
  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("id", activityId)
  if (error) {
    console.error("Error deleting activity:", error);
    return { success: false, error: "Failed to delete activity" };
  }
  return { success: true };
}
