import { addCardActivity, fetchCardActivities } from "@/actions/activity-actions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cardId = searchParams.get("cardId") || "";

  const activities = await fetchCardActivities(cardId);

  return new Response(JSON.stringify(activities), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function POST(request: Request) {
  const { cardId, boardId, actionType, data: cardData } = await request.json();
  const { data } = await addCardActivity(cardId, boardId, actionType, cardData);
  return new Response(JSON.stringify(data), {
    status: 201,
    headers: {
      "Content-Type": "application/json",
    },
  });
}