import { Suspense } from "react"
import GameClient from "./client-page"
import { SiteFooter } from "@/components/site-footer"
import { Navbar } from "@/components/navbar"
import type { Metadata } from "next"
import { getProductById, getCategoryById } from "@/lib/db"

// Tambahkan opsi untuk tidak menggunakan cache
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata({ params }: { params: { game: string } }): Promise<Metadata> {
  // Coba ambil data game
  const game = (await getCategoryById(params.game)) || (await getProductById(params.game))

  if (!game) {
    return {
      title: "Game Tidak Ditemukan",
    }
  }

  return {
    title: `Top Up ${game.name}`,
    description: game.description || `Top up ${game.name} dengan harga termurah dan proses instan di Zkygame`,
  }
}

export default function GamePage({ params }: { params: { game: string } }) {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div>Loading...</div>}>
        <GameClient gameId={params.game} />
      </Suspense>
      <SiteFooter />
    </>
  )
}

