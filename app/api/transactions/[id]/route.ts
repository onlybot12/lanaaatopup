import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log(`GET /api/transactions/${id} - Fetching transaction`)

    const client = await clientPromise
    const db = client.db()

    // Coba cari berdasarkan _id jika valid ObjectId
    let transaction = null
    if (ObjectId.isValid(id)) {
      console.log(`Searching by ObjectId: ${id}`)
      transaction = await db.collection("transactions").findOne({
        _id: new ObjectId(id),
      })
    }

    // Jika tidak ditemukan, cari berdasarkan referenceId
    if (!transaction) {
      console.log(`Searching by referenceId: ${id}`)
      transaction = await db.collection("transactions").findOne({
        referenceId: id,
      })
    }

    // Jika masih tidak ditemukan, cari berdasarkan transactionId
    if (!transaction) {
      console.log(`Searching by transactionId: ${id}`)
      transaction = await db.collection("transactions").findOne({
        $or: [{ transactionId: id }, { "qrisData.result.transactionId": id }],
      })
    }

    if (!transaction) {
      console.log(`Transaction with ID ${id} not found`)
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 })
    }

    console.log(`Transaction found: ${transaction._id}`)
    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Error fetching transaction:", error)
    return NextResponse.json({ error: "Gagal mengambil data transaksi" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const updates = await request.json()

    const client = await clientPromise
    const db = client.db()

    // Hapus _id dari updates jika ada
    if (updates._id) {
      delete updates._id
    }

    // Update timestamp
    updates.updatedAt = new Date()

    let result
    if (ObjectId.isValid(id)) {
      result = await db.collection("transactions").updateOne({ _id: new ObjectId(id) }, { $set: updates })
    } else {
      result = await db.collection("transactions").updateOne({ referenceId: id }, { $set: updates })
    }

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({ success: true, updated: result.modifiedCount })
  } catch (error) {
    console.error("Error updating transaction:", error)
    return NextResponse.json({ error: "Gagal memperbarui transaksi" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const client = await clientPromise
    const db = client.db()

    let result
    if (ObjectId.isValid(id)) {
      result = await db.collection("transactions").deleteOne({
        _id: new ObjectId(id),
      })
    } else {
      result = await db.collection("transactions").deleteOne({
        referenceId: id,
      })
    }

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({ success: true, deleted: result.deletedCount })
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return NextResponse.json({ error: "Gagal menghapus transaksi" }, { status: 500 })
  }
}

