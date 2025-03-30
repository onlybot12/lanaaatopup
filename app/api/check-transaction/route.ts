import { type NextRequest, NextResponse } from "next/server"
import { getTransactionByReferenceId, updateTransaction } from "@/lib/db"
import axios from "axios"

export async function POST(request: NextRequest) {
  try {
    const { product, dest, refId, memberID, pin, password } = await request.json()

    if (!memberID || !pin || !password || !refId) {
      return NextResponse.json({ error: "Parameter yang diperlukan tidak lengkap" }, { status: 400 })
    }

    const apiUrl = `https://h2h.okeconnect.com/trx?memberID=${memberID}&pin=${pin}&password=${password}&product=${product}&dest=${dest}&refID=${refId}`

    const response = await axios.get(apiUrl)
    const responseText = response.data

    // Use a safer regex pattern that doesn't rely on line breaks
    const statusMatch = responseText.match(/status\s+(\w+)/i)
    const status = statusMatch ? statusMatch[1] : "Unknown"

    // Fixed regex pattern to avoid line break issues
    const snMatch = responseText.match(/SN:\s+([^\s.,]+)/i)
    const serialNumber = snMatch ? snMatch[1] : ""

    const transaction = await getTransactionByReferenceId(refId)
    if (transaction) {
      await updateTransaction(transaction._id.toString(), {
        status: status.toLowerCase() === "sukses" ? "success" : "pending",
        updatedAt: new Date(),
      })
    }

    return NextResponse.json({
      success: true,
      raw: responseText,
      status,
      serialNumber,
    })
  } catch (error) {
    console.error("Error checking transaction status:", error)
    return NextResponse.json({ error: "Gagal memeriksa status transaksi" }, { status: 500 })
  }
}

