import { type NextRequest, NextResponse } from "next/server"
import { getProducts, createProduct, getProductsByCategory } from "@/lib/db"
import axios from "axios"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")
    const categoryId = searchParams.get("category")
    const limit = searchParams.get("limit") || "100"

    if (url) {
      try {
        const response = await axios.get(url)
        const data = response.data
        const products = Array.isArray(data) ? data.slice(0, Number.parseInt(limit)) : []
        return NextResponse.json(products)
      } catch (error) {
        console.error("Error fetching products from URL:", error)
        return NextResponse.json({ error: "Gagal mengambil data produk dari URL" }, { status: 500 })
      }
    }

    if (categoryId) {
      try {
        const products = await getProductsByCategory(categoryId)
        return NextResponse.json(products)
      } catch (error) {
        console.error("Error fetching products by category:", error)
        return NextResponse.json({ error: "Gagal mengambil data produk berdasarkan kategori" }, { status: 500 })
      }
    }

    try {
      const products = await getProducts()
      return NextResponse.json(products)
    } catch (error) {
      console.error("Error fetching all products:", error)
      return NextResponse.json({ error: "Gagal mengambil semua data produk" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in products API route:", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const product = await request.json()

    // Validate required fields
    if (!product.name) {
      return NextResponse.json({ error: "Nama produk harus diisi" }, { status: 400 })
    }

    if (!product.packages || product.packages.length === 0) {
      return NextResponse.json({ error: "Minimal satu paket harus ditambahkan" }, { status: 400 })
    }

    // Ensure timestamps
    if (!product.createdAt) {
      product.createdAt = new Date()
    }

    if (!product.updatedAt) {
      product.updatedAt = new Date()
    }

    const result = await createProduct(product)
    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Gagal membuat produk baru" }, { status: 500 })
  }
}

