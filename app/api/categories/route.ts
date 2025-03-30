import { type NextRequest, NextResponse } from "next/server"
import { getCategories, createCategory } from "@/lib/db"

export async function GET() {
  try {
    const categories = await getCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Gagal mengambil data kategori" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const category = await request.json()
    const result = await createCategory(category)
    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Gagal membuat kategori baru" }, { status: 500 })
  }
}

