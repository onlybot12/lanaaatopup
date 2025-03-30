import { Suspense } from "react"
import CheckoutClient from "./client-page"

export default function CheckoutPage({ params }: { params: { game: string } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutClient gameId={params.game} />
    </Suspense>
  )
}

