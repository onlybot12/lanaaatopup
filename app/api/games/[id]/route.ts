import { type NextRequest, NextResponse } from "next/server"
import { getProductById, getCategoryById } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Tambahkan timestamp untuk menghindari cache
    const timestamp = new Date().getTime()

    // Coba ambil data dari kategori terlebih dahulu
    let game = await getCategoryById(params.id)

    if (!game) {
      // Jika tidak ditemukan di kategori, coba cari di produk
      game = await getProductById(params.id)
    }

    if (!game) {
      return NextResponse.json({ error: "Game tidak ditemukan" }, { status: 404 })
    }

    // Jika ini adalah kategori, cari produk terkait untuk mendapatkan paket
    if (!game.packages) {
      const product = await getProductById(params.id)

      if (!product) {
        // Jika tidak ada produk dengan ID yang sama, cari produk berdasarkan kategori
        const products = await fetch(
          `${request.nextUrl.origin}/api/products?category=${params.id}&t=${timestamp}`,
        ).then((res) => res.json())

        if (products && products.length > 0) {
          // Gabungkan data kategori dengan paket dari produk pertama yang ditemukan
          game = {
            ...game,
            packages: products[0].packages || [],
          }
        } else {
          // Jika tidak ada produk terkait, tetapkan packages sebagai array kosong
          game = {
            ...game,
            packages: [],
          }
        }
      } else {
        // Gabungkan data kategori dengan paket dari produk
        game = {
          ...game,
          packages: product.packages || [],
        }
      }
    }

    return NextResponse.json(game)
  } catch (error) {
    console.error("Error in GET /api/games/[id]:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat mengambil data game" }, { status: 500 })
  }
}

