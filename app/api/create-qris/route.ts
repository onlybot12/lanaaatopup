import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const { amount, codeqr, transactionId } = await request.json()

    // Validasi input
    if (!amount || !codeqr) {
      return NextResponse.json({ error: "Parameter yang diperlukan tidak lengkap" }, { status: 400 })
    }

    console.log(`Creating QRIS with amount: ${amount}, transactionId: ${transactionId || "none"}`)

    // Jika transactionId disediakan, periksa apakah QRIS sudah ada
    if (transactionId) {
      const client = await clientPromise
      const db = client.db()

      const existingTransaction = await db.collection("transactions").findOne({
        _id: new ObjectId(transactionId),
        qrisData: { $exists: true },
      })

      if (existingTransaction && existingTransaction.qrisData) {
        console.log(`Using existing QRIS for transaction ${transactionId}`)
        return NextResponse.json(existingTransaction.qrisData)
      }
    }

    // Pastikan amount adalah angka yang valid
    const numericAmount = Number(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "Jumlah harus berupa angka positif" }, { status: 400 })
    }

    // Buat QRIS baru
    console.log(`Making API call to create QRIS with amount: ${numericAmount}`)
    const response = await axios.get(
      `https://api.itzky.xyz/orkut/createqris?apikey=Sumbul&amount=${numericAmount}&codeqr=${codeqr}`,
    )

    if (!response.data.success) {
      throw new Error(`Gagal membuat QRIS: ${response.status}`)
    }

    console.log(`QRIS created successfully with amount: ${numericAmount}`)
    return NextResponse.json(response.data)
  } catch (error) {
    console.error("Error creating QRIS:", error)
    return NextResponse.json({ error: "Gagal membuat QRIS" }, { status: 500 })
  }
}

