import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

// Update the GET function to add more filtering options and limit results

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const referenceId = searchParams.get("referenceId")
    const transactionId = searchParams.get("transactionId")
    const qrisTransactionId = searchParams.get("qrisTransactionId")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const client = await clientPromise
    const db = client.db()

    // If there's a specific ID to search for
    if (referenceId || transactionId || qrisTransactionId) {
      const query: any = {}

      if (referenceId) {
        query.referenceId = referenceId
      }

      if (transactionId) {
        query.$or = query.$or || []
        query.$or.push({ transactionId: transactionId })
        query.$or.push({ "qrisData.result.transactionId": transactionId })
      }

      if (qrisTransactionId) {
        query.$or = query.$or || []
        query.$or.push({ qrisTransactionId: qrisTransactionId })
      }

      const transaction = await db.collection("transactions").findOne(query)

      if (!transaction) {
        return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 })
      }

      return NextResponse.json(transaction)
    }

    // If no specific ID, get the most recent transactions with limit
    const transactions = await db.collection("transactions").find({}).sort({ createdAt: -1 }).limit(limit).toArray()

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Gagal mengambil data transaksi" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const transaction = await request.json()

    if (!transaction.referenceId && !transaction.transactionId) {
      return NextResponse.json({ error: "Parameter referenceId atau transactionId diperlukan" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Tambahkan timestamp
    transaction.createdAt = new Date()
    transaction.updatedAt = new Date()

    const result = await db.collection("transactions").insertOne(transaction)
    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ error: "Gagal membuat transaksi baru" }, { status: 500 })
  }
}

