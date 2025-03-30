import { NextResponse } from "next/server"
import { nanoid } from "nanoid"
import clientPromise from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const { userId, email, whatsapp, productCode, amount } = await request.json()

    // Validasi input
    if (!userId || !productCode || !amount) {
      return NextResponse.json({ success: false, message: "Data tidak lengkap" }, { status: 400 })
    }

    // Generate a unique reference ID
    const referenceId = `ZKY${nanoid(8).toUpperCase()}`

    // Generate random fee between 5-10
    const fee = Math.floor(Math.random() * 6) + 5

    const client = await clientPromise
    const db = client.db()

    // Create the transaction
    const transaction = {
      referenceId,
      userId,
      email: email || "",
      whatsapp: whatsapp || "",
      productCode,
      amount,
      fee, // Tambahkan fee ke transaksi
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("transactions").insertOne(transaction)

    return NextResponse.json({
      success: true,
      message: "Transaksi berhasil dibuat",
      transaction: {
        ...transaction,
        _id: result.insertedId,
      },
    })
  } catch (error) {
    console.error("Error creating checkout:", error)
    return NextResponse.json({ success: false, message: "Terjadi kesalahan saat membuat checkout" }, { status: 500 })
  }
}

