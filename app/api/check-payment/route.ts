import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"
import { updateTransaction, getTransactionByReferenceId } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { merchant, token, transactionId, referenceId } = await request.json()

    const response = await axios.get(
      `https://api.itzky.xyz/orkut/checkstatus?apikey=Sumbul&merchant=${merchant}&token=${token}`,
    )

    if (!response.data.success) {
      throw new Error(`Gagal memeriksa status pembayaran: ${response.status}`)
    }

    if (referenceId) {
      const transaction = await getTransactionByReferenceId(referenceId)
      if (transaction) {
        await updateTransaction(transaction._id.toString(), {
          status: response.data.result.status === "success" ? "success" : "pending",
          updatedAt: new Date(),
        })
      }
    }

    return NextResponse.json(response.data)
  } catch (error) {
    console.error("Error checking payment status:", error)
    return NextResponse.json({ error: "Gagal memeriksa status pembayaran" }, { status: 500 })
  }
}

