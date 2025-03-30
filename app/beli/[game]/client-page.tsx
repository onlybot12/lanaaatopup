"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { MessageSquare, Zap, Check, Star, CreditCard, Info } from "lucide-react"
import { ParticlesBackground } from "@/components/particles-background"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Sidebar } from "@/components/sidebar"
import { useAlert } from "@/components/custom-alert"

export default function GameClient({ gameId }: { gameId: string }) {
  const router = useRouter()
  const [game, setGame] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [userId, setUserId] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [showGameInfo, setShowGameInfo] = useState(false)
  const { showAlert } = useAlert()

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true)
        // Tambahkan timestamp untuk menghindari cache
        const timestamp = new Date().getTime()
        const response = await fetch(`/api/games/${gameId}?t=${timestamp}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Game tidak ditemukan")
          }
          throw new Error("Gagal mengambil data game")
        }

        const data = await response.json()
        console.log("Game data:", data) // Untuk debugging
        setGame(data)

        // Set default selected package if available
        if (data.packages && data.packages.length > 0) {
          setSelectedPackage(data.packages[0])
        }
      } catch (err) {
        console.error("Error fetching game:", err)
        setError(err.message || "Terjadi kesalahan")
      } finally {
        setLoading(false)
      }
    }

    fetchGame()
  }, [gameId])

  const handleProceedToCheckout = () => {
    if (!selectedPackage) {
      showAlert({ type: "error", message: "Silahkan pilih nominal terlebih dahulu" })
      return
    }

    if (!userId) {
      showAlert({ type: "error", message: "Silahkan masukkan User ID" })
      return
    }

    if (!whatsapp) {
      showAlert({ type: "error", message: "Silahkan masukkan nomor WhatsApp" })
      return
    }

    setIsConfirmDialogOpen(true)
  }

  const handleConfirmPurchase = async () => {
    setIsConfirmDialogOpen(false)

    if (userId && selectedPackage) {
      // Simpan data untuk pemrosesan transaksi nanti
      localStorage.setItem("zkygame_userId", userId)

      // Cari paket yang dipilih untuk mendapatkan kode API
      if (selectedPackage && selectedPackage.apiCode) {
        localStorage.setItem("zkygame_selectedProduct", selectedPackage.apiCode)
      }

      // Simpan nomor WhatsApp untuk notifikasi
      localStorage.setItem("zkygame_whatsapp", whatsapp)

      // Buat transaksi di database
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          email: localStorage.getItem("zkygame_email") || "",
          whatsapp,
          productCode: selectedPackage.apiCode || selectedPackage.id,
          amount: Number.parseInt(selectedPackage.price.replace(/\D/g, "")),
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Redirect ke halaman invoice dengan ID transaksi yang benar
        router.push(`/invoice/${data.transaction.referenceId}`)
      } else {
        showAlert({ type: "error", message: data.message || "Gagal membuat checkout" })
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-muted-foreground">{error || "Game tidak ditemukan"}</p>
        <Button className="mt-4" onClick={() => router.push("/")}>
          Kembali ke Beranda
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block w-64 border-r">
        <Sidebar />
      </div>

      <main className="flex-1 container max-w-xl py-4 relative">
        <div className="mb-6">
          <div className="relative rounded-lg overflow-hidden h-40 mb-4">
            <ParticlesBackground />
            <div className="absolute bottom-0 left-0 z-10 flex items-start gap-3 p-4">
              <div className="relative">
                <Image
                  src={game.image || "/placeholder.svg"}
                  alt={game.name}
                  width={60}
                  height={60}
                  className="rounded-lg"
                />
                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                  Beli
                </div>
              </div>
              <div>
                <div>
                  <h1 className="text-xl font-bold mb-1">{game.name}</h1>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-primary text-sm">{game.publisher}</p>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <Star className="h-3 w-3 text-yellow-500" />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setShowGameInfo(true)}
                    >
                      <Info className="h-3 w-3 mr-1" />
                      Info
                    </Button>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-1 text-xs">
                      <Zap className="h-3 w-3 text-blue-500" />
                      Proses Cepat
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <MessageSquare className="h-3 w-3 text-green-500" />
                      Layanan Chat 24/7
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-secondary/50 p-3 mb-6">
            <p className="font-medium mb-2 text-sm">Top up {game.name} token harga paling murah.</p>
            <p className="mb-1 text-xs text-muted-foreground">Cara topup termurah:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-xs text-muted-foreground">
              <li>Masukkan UID {game.name}</li>
              <li>Pilih Nominal</li>
              <li>Masukkan No WhatsApp</li>
              <li>Klik Lanjut & lakukan Pembayaran</li>
              <li>Token otomatis masuk ke akun game</li>
            </ol>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold mb-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 inline-flex items-center justify-center rounded-lg mr-2 text-xs">
                  1
                </span>
                Masukkan Data Akun
              </h2>
              <div className="space-y-2">
                <div>
                  <label className="block mb-1 text-sm">{game.inputLabel || "UID"}</label>
                  <Input
                    type={game.inputType || "text"}
                    placeholder={game.inputPlaceholder || "ID Game"}
                    className="focus-visible-none text-sm"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {game.inputHelp ||
                    "Untuk menemukan UID Pengguna Anda, klik avatar Anda di pojok kanan atas layar dan buka tab settings. Contoh: 12345678"}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold mb-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 inline-flex items-center justify-center rounded-lg mr-2 text-xs">
                  2
                </span>
                Pilih Nominal
              </h2>
              <div className="h-[300px] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  {game.packages && game.packages.length > 0 ? (
                    game.packages.map((pkg, index) => (
                      <button
                        key={pkg.id || index}
                        className={`flex flex-col p-2 rounded-lg border ${
                          selectedPackage === pkg
                            ? "border-primary bg-primary/10"
                            : "bg-background hover:bg-secondary/50"
                        } text-left relative transition-colors duration-200 min-h-[60px]`}
                        onClick={() => setSelectedPackage(pkg)}
                      >
                        <span className="font-medium text-xs">
                          {game.name} {pkg.name}
                        </span>
                        <span className="text-xs text-red-600 font-bold">Rp. {pkg.price}</span>
                        {selectedPackage === pkg && (
                          <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="col-span-2 text-center p-4 text-muted-foreground">
                      Tidak ada paket tersedia untuk produk ini
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold mb-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 inline-flex items-center justify-center rounded-lg mr-2 text-xs">
                  3
                </span>
                Detail Kontak
              </h2>
              <div className="space-y-2">
                <div>
                  <label className="block mb-1 text-sm">WhatsApp</label>
                  <Input
                    type="tel"
                    placeholder="Masukan Nomor WhatsApp"
                    className="focus-visible-none text-sm"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">**Nomor ini akan dihubungi jika terjadi masalah.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-3">
          <div className="container max-w-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Image
                  src={game.image || "/placeholder.svg"}
                  alt={game.name}
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <div>
                  <h3 className="font-medium text-sm">
                    {game.name} {selectedPackage ? selectedPackage.name : ""}
                  </h3>
                  <p className="text-xs text-muted-foreground">**Waktu proses instan</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-sm text-red-600">
                  {selectedPackage ? `Rp. ${selectedPackage.price}` : "Pilih paket"}
                </div>
              </div>
            </div>
            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-white text-primary-foreground text-sm"
              size="sm"
              onClick={handleProceedToCheckout}
            >
              Pesan Sekarang!
            </Button>
          </div>
        </div>

        <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Konfirmasi Pembelian</DialogTitle>
              <DialogDescription>Pastikan data yang Anda masukkan sudah benar</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-md border bg-muted/30">
                <Image
                  src={game.image || "/placeholder.svg"}
                  alt={game.name}
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <div>
                  <h3 className="font-medium">{game.name}</h3>
                  <p className="text-xs text-muted-foreground">{game.publisher}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">User ID</p>
                    <p className="text-sm">{userId}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">WhatsApp</p>
                    <p className="text-sm">{whatsapp}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Nominal</p>
                  <div className="flex items-center justify-between p-2 rounded-md border">
                    <p className="text-sm">{selectedPackage?.name}</p>
                    <p className="text-sm font-medium text-red-600">Rp. {selectedPackage?.price}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Metode Pembayaran</p>
                  <div className="flex items-center gap-2 p-2 rounded-md border">
                    <CreditCard className="h-4 w-4 text-red-600" />
                    <p className="text-sm">QRIS (Semua e-wallet & mobile banking)</p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
                Ubah
              </Button>
              <Button onClick={handleConfirmPurchase}>Lanjutkan Pembayaran</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showGameInfo} onOpenChange={setShowGameInfo}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Informasi {game.name}</DialogTitle>
              <DialogDescription>Informasi tambahan tentang {game.name}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {game.description ? (
                <p className="text-sm">{game.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Tidak ada informasi tambahan untuk game ini.</p>
              )}

              {game.popup && (
                <div className="mt-4 p-3 bg-secondary/30 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-primary" />
                    <h3 className="font-medium text-sm">Informasi Penting</h3>
                  </div>
                  <p className="text-sm">{game.popup}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setShowGameInfo(false)}>Tutup</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

