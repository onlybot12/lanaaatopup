import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { transactionId, amount } = await request.json()

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID diperlukan" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Cari transaksi berdasarkan transactionId
    const transaction = await db.collection("transactions").findOne({ transactionId })

    if (!transaction) {
      // Jika transaksi tidak ditemukan, buat transaksi baru dengan status cancelled
      await db.collection("transactions").insertOne({
        transactionId,
        amount,
        status: "cancelled",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    } else {
      // Jika transaksi ditemukan, update statusnya menjadi cancelled
      await db
        .collection("transactions")
        .updateOne({ transactionId }, { $set: { status: "cancelled", updatedAt: new Date() } })
    }

    return NextResponse.json({ success: true, message: "Invoice berhasil dibatalkan" })
  } catch (error) {
    console.error("Error cancelling invoice:", error)
    return NextResponse.json({ error: "Gagal membatalkan invoice" }, { status: 500 })
  }
}

