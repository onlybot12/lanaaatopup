import { type NextRequest, NextResponse } from "next/server"
import { getWebsiteSettings, updateWebsiteSettings } from "@/lib/db"

export async function GET() {
  try {
    const settings = await getWebsiteSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Gagal mengambil pengaturan website" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json()

    // Validate required fields
    if (!settings.siteName) {
      return NextResponse.json({ error: "Nama situs harus diisi" }, { status: 400 })
    }

    const result = await updateWebsiteSettings(settings)
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Gagal memperbarui pengaturan website" }, { status: 500 })
  }
}

