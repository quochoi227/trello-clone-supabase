import { createClient } from "@/lib/supabase/server"

const CARD_COVERS_BUCKET = "card-covers"
const MAX_FILE_SIZE = 5 * 1024 * 1024

const sanitizeFileName = (name: string) =>
  name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "")

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: cardId } = await context.params
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return new Response(
        JSON.stringify({ success: false, error: "No file uploaded" }),
        { status: 400 }
      )
    }

    if (!file.type.startsWith("image/")) {
      return new Response(
        JSON.stringify({ success: false, error: "Only image files are allowed" }),
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ success: false, error: "File size must be smaller than 5MB" }),
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401 }
      )
    }

    const fileName = sanitizeFileName(file.name || "cover.jpg")
    // const filePath = `${user.id}/${cardId}/${Date.now()}-${fileName}`
    const filePath = `${Date.now()}-${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(CARD_COVERS_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      return new Response(
        JSON.stringify({ success: false, error: uploadError.message }),
        { status: 500 }
      )
    }

    const { data: publicUrlData } = supabase.storage
      .from(CARD_COVERS_BUCKET)
      .getPublicUrl(filePath)

    const coverUrl = publicUrlData.publicUrl

    const { data: updatedCard, error: updateError } = await supabase
      .from("cards")
      .update({
        cover: coverUrl,
        // owner_id: user.id,
      })
      .eq("id", cardId)
      .select("*")
      .single()

    if (updateError) {
      return new Response(
        JSON.stringify({ success: false, error: updateError.message }),
        { status: 500 }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...updatedCard,
          columnId: updatedCard.column_id,
        },
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error("Unexpected error uploading card cover:", error)
    return new Response(
      JSON.stringify({ success: false, error: "An unexpected error occurred" }),
      { status: 500 }
    )
  }
}
