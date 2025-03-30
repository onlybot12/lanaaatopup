import { type NextRequest, NextResponse } from "next/server"
import { getTypeById, updateType, deleteType } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const type = await getTypeById(params.id)
    if (!type) {
      return NextResponse.json({ error: "Tipe tidak ditemukan" }, { status: 404 })
    }
    return NextResponse.json(type)
  } catch (error) {
    console.error("Error fetching type:", error)
    return NextResponse.json({ error: "Gagal mengambil data tipe" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const type = await request.json()
    const result = await updateType(params.id, type)
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error updating type:", error)
    return NextResponse.json({ error: "Gagal memperbarui tipe" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await deleteType(params.id)
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error deleting type:", error)
    return NextResponse.json({ error: "Gagal menghapus tipe" }, { status: 500 })
  }
}

