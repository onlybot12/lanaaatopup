import { type NextRequest, NextResponse } from "next/server"
import { createTransaction, updateTransaction } from "@/lib/db"
import axios from "axios"

export async function POST(request: NextRequest) {
  try {
    const { product, dest, refId, memberID, pin, password } = await request.json()

    if (!product || !dest || !refId) {
      return NextResponse.json({ error: "Parameter yang diperlukan tidak lengkap" }, { status: 400 })
    }

    const actualMemberID = memberID || "OK1356619"
    const actualPin = pin || "4152"
    const actualPassword = password || "Zaki4321"

    const apiUrl = `https://h2h.okeconnect.com/trx?product=${product}&dest=${dest}&refID=${refId}&memberID=${actualMemberID}&pin=${actualPin}&password=${actualPassword}`

    const transaction = {
      userId: dest,
      productCode: product,
      amount: 0,
      status: "pending",
      referenceId: refId,
      transactionId: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const dbResult = await createTransaction(transaction)

    const response = await axios.get(apiUrl)
    const responseText = response.data

    await updateTransaction(dbResult.insertedId.toString(), {
      status: responseText.includes("Sukses") ? "success" : "pending",
      updatedAt: new Date(),
    })

    return NextResponse.json({ success: true, message: responseText })
  } catch (error) {
    console.error("Error processing transaction:", error)
    return NextResponse.json({ error: "Gagal memproses transaksi" }, { status: 500 })
  }
}

