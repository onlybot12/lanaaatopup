"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, ArrowLeft, CreditCard, Smartphone } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAlert } from "@/components/custom-alert"

export default function CheckoutPage({
  gameData,
  selectedPackage,
  userId,
}: {
  gameData: any
  selectedPackage: any
  userId: string
}) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const { showAlert } = useAlert()

  useEffect(() => {
    // Cek apakah ada data yang tersimpan di localStorage
    const savedEmail = localStorage.getItem("zkygame_email")
    const savedWhatsapp = localStorage.getItem("zkygame_whatsapp")

    if (savedEmail) setEmail(savedEmail)
    if (savedWhatsapp) setWhatsapp(savedWhatsapp)
  }, [])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!userId) {
      newErrors.userId = "ID Pengguna harus diisi"
    }

    if (!email) {
      newErrors.email = "Email harus diisi"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Format email tidak valid"
    }

    if (!whatsapp) {
      newErrors.whatsapp = "Nomor WhatsApp harus diisi"
    } else if (!/^[0-9+]{10,15}$/.test(whatsapp.replace(/\s/g, ""))) {
      newErrors.whatsapp = "Format nomor WhatsApp tidak valid"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCheckout = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Simpan data pengguna ke localStorage
      localStorage.setItem("zkygame_userId", userId)
      localStorage.setItem("zkygame_email", email)
      localStorage.setItem("zkygame_whatsapp", whatsapp)
      localStorage.setItem("zkygame_selectedProduct", selectedPackage.code)

      // Buat transaksi di database
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          email,
          whatsapp,
          productCode: selectedPackage.code,
          amount: selectedPackage.price,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Redirect ke halaman invoice dengan ID transaksi yang benar
        router.push(`/invoice/${data.transaction.referenceId}`)
      } else {
        showAlert({ type: "error", message: data.message || "Gagal membuat checkout" })
      }
    } catch (error) {
      console.error("Error during checkout:", error)
      showAlert({ type: "error", message: "Terjadi kesalahan saat proses checkout" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pembayaran</CardTitle>
              <CardDescription>Masukkan informasi untuk menyelesaikan pembelian</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-id">ID Pengguna Game</Label>
                  <Input id="user-id" value={userId} disabled className="bg-muted" />
                  {errors.userId && <p className="text-destructive text-sm">{errors.userId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                  {errors.whatsapp && <p className="text-destructive text-sm">{errors.whatsapp}</p>}
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Pastikan ID Pengguna Game sudah benar. Kesalahan input ID dapat menyebabkan item tidak masuk ke akun
                  Anda.
                </AlertDescription>
              </Alert>

              <div>
                <h3 className="font-medium mb-2">Metode Pembayaran</h3>
                <Tabs defaultValue="qris">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="qris">
                      <CreditCard className="mr-2 h-4 w-4" />
                      QRIS
                    </TabsTrigger>
                    <TabsTrigger value="bank" disabled>
                      <Smartphone className="mr-2 h-4 w-4" />
                      Bank Transfer
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="qris" className="mt-4">
                    <div className="rounded-lg border p-4">
                      <p className="text-sm">
                        Pembayaran menggunakan QRIS dapat dilakukan melalui aplikasi e-wallet seperti GoPay, OVO, DANA,
                        LinkAja, atau aplikasi mobile banking.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{gameData?.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedPackage?.name}</p>
                </div>

                <div className="rounded-lg bg-muted p-3">
                  <div className="flex justify-between text-sm">
                    <span>ID Pengguna:</span>
                    <span className="font-medium">{userId}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Harga</span>
                    <span>Rp {selectedPackage?.price?.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Biaya Admin</span>
                    <span>Rp 0</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-red-600">Rp {selectedPackage?.price?.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                onClick={handleCheckout}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Memproses..." : "Bayar Sekarang"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

