import { getUserAction } from "@/actions/auth-actions";

export async function GET() {
  const { user, error } = await getUserAction()
  if (error) {
    return new Response(JSON.stringify({ error }), { status: 401 })
  }
  return new Response(JSON.stringify({ user }), { status: 200 })
}