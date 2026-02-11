import { deleteActivity, fetchActivityDetail, updateActivity } from "@/actions/activity-actions";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const data = await fetchActivityDetail(id);

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const data = await request.json();
  // Here you would implement the logic to update the activity with the given id
  // For example, you might call an action like updateActivity(id, body)
  const { success, data: updatedActivity, error } = await updateActivity(
    id,
    data
  );

  if (!success) {
    return new Response(JSON.stringify({ error }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return new Response(JSON.stringify(updatedActivity), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  // Here you would implement the logic to delete the activity with the given id
  // For example, you might call an action like deleteActivity(id)
  const { success, error } = await deleteActivity(id);

  if (!success) {
    return new Response(JSON.stringify({ error }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
