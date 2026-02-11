"use server"

import type { ActivityWithUser } from "@/types/activity";
import { createClient } from "@/lib/supabase/server";

export async function fetchCardActivities(cardId: string): Promise<ActivityWithUser[]> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to add an activity");
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

  // Transform data - không cần filter(Boolean)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activitiesWithUser = data?.map(activity => {
    return {
      ...activity,
      user: user ? {
        id: user.id,
        email: user.email || "",
        name: user.user_metadata?.name || "Unknown",
        avatar: user.user_metadata?.avatar_url || ""
      } : null
    };
  }) || [];

  return activitiesWithUser as ActivityWithUser[];
}

export async function addCardActivity(
  cardId: string,
  boardId: string,
  actionType: ActivityWithUser["action_type"],
  data: Record<string, unknown>
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

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

  // Transform data để match ActivityWithUser type
  const activityWithUser: ActivityWithUser = {
    ...resData,
    user: {
      id: user.id,
      email: user.email || "",
      name: user.user_metadata?.name || "Unknown",
      avatar: user.user_metadata?.avatar_url || ""
    }
  };

  return { success: true, data: activityWithUser };
}

export const fetchActivityDetail = async (activityId: string) => {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to add an activity");
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

  console.log("Fetched activity detail:", data);
  return {
    ...data,
    user: user ? {
      id: user.id,
      email: user.email || "",
      name: user.user_metadata?.name || "Unknown",
      avatar: user.user_metadata?.avatar_url || ""
    } : null
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
  return { success: true, data: {
    ...data,
    user: {
      id: user.id,
      email: user.email || "",
      name: user.user_metadata?.name || "Unknown",
      avatar: user.user_metadata?.avatar_url || ""
    }
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
