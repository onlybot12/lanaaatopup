import { type NextRequest, NextResponse } from "next/server"
import { getProductById, updateProduct, deleteProduct } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await getProductById(params.id)
    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Gagal mengambil data produk" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await request.json()
    const result = await updateProduct(params.id, product)
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Gagal memperbarui produk" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await deleteProduct(params.id)
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Gagal menghapus produk" }, { status: 500 })
  }
}

