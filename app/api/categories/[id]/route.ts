import { type NextRequest, NextResponse } from "next/server"
import { getCategoryById, updateCategory, deleteCategory } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const category = await getCategoryById(params.id)
    if (!category) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 })
    }
    return NextResponse.json(category)
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json({ error: "Gagal mengambil data kategori" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const category = await request.json()
    const result = await updateCategory(params.id, category)
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ error: "Gagal memperbarui kategori" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await deleteCategory(params.id)
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Gagal menghapus kategori" }, { status: 500 })
  }
}

