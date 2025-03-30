import { type NextRequest, NextResponse } from "next/server"
import { getTypes, createType } from "@/lib/db"

export async function GET() {
  try {
    const types = await getTypes()
    return NextResponse.json(types)
  } catch (error) {
    console.error("Error fetching types:", error)
    return NextResponse.json({ error: "Gagal mengambil data tipe" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const type = await request.json()
    const result = await createType(type)
    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error("Error creating type:", error)
    return NextResponse.json({ error: "Gagal membuat tipe baru" }, { status: 500 })
  }
}

