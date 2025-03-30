import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    const [transactions, products, users] = await Promise.all([
      db.collection("transactions").find({}).toArray(),
      db.collection("products").find({}).toArray(),
      db.collection("users").find({}).toArray(),
    ])

    const totalRevenue = transactions.reduce((sum, transaction) => {
      return sum + (transaction.amount || 0)
    }, 0)

    const totalOrders = transactions.length
    const totalUsers = users.length
    const totalTransactions = transactions.length

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalUsers,
      totalTransactions,
      recentTransactions: transactions.slice(0, 5),
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Gagal mengambil data dashboard" }, { status: 500 })
  }
}

