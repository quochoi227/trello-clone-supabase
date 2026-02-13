import { declineBoardInvitation } from '@/actions/board-invitation-actions'

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: invitationId } = await context.params;
  const data = await declineBoardInvitation({ invitationId });
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
