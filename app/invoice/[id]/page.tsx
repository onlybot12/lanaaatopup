"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { X, Clock, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAlert } from "@/components/custom-alert"

interface QrisResponse {
  success: boolean
  status: number
  creator: string
  result: {
    transactionId: string
    amount: string
    expirationTime: string
    qrImageUrl: string
  }
}

export default function InvoicePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [minutes, setMinutes] = useState(4)
  const [seconds, setSeconds] = useState(54)
  const [qrisData, setQrisData] = useState<QrisResponse | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed" | "cancelled">("pending")
  const [isLoading, setIsLoading] = useState(true)
  const [fee, setFee] = useState(0)
  const [transactionId, setTransactionId] = useState("")
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [transaction, setTransaction] = useState<any>(null)
  const { showAlert } = useAlert()

  const timerInterval = useRef<number | null>(null)
  const statusCheckInterval = useRef<number | null>(null)

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setIsLoading(true)
        const timestamp = new Date().getTime()

        console.log(`Fetching transaction with ID: ${params.id}`)

        // Fetch transaction using the ID from params
        const response = await fetch(`/api/transactions/${params.id}?t=${timestamp}`)

        if (response.ok) {
          const data = await response.json()
          console.log("Transaction data:", data)
          setTransaction(data)
          setPaymentStatus(data.status)

          // If we already have QRIS data, use it
          if (data.qrisData) {
            setQrisData(data.qrisData)
            setTransactionId(data.qrisData.result.transactionId)

            // Set timer based on expiration time if available
            if (data.qrisData.result.expirationTime) {
              const expiryTime = new Date(data.qrisData.result.expirationTime).getTime()
              const currentTime = new Date().getTime()
              const timeLeft = Math.max(0, expiryTime - currentTime)

              // Convert milliseconds to minutes and seconds
              const minutesLeft = Math.floor(timeLeft / 60000)
              const secondsLeft = Math.floor((timeLeft % 60000) / 1000)

              if (minutesLeft >= 0 && secondsLeft >= 0) {
                setMinutes(minutesLeft)
                setSeconds(secondsLeft)
              }
            }
          }
          // If we have a transactionId but no QRIS data, use the transactionId
          else if (data.transactionId) {
            setTransactionId(data.transactionId)
          }

          // Set fee only if it doesn't exist yet
          if (data.fee) {
            setFee(data.fee)
          } else {
            // Generate fee only once and save it
            const randomFee = Math.floor(Math.random() * 6) + 5
            setFee(randomFee)
            updateTransactionFee(data._id, randomFee)
          }

          // Only create QRIS if we don't have QRIS data and don't have a transactionId
          // AND the status is still pending
          if (data.status === "pending" && !data.qrisData && !data.transactionId) {
            createQris(data.amount, data._id)
          }
        } else {
          console.error(`Failed to fetch transaction with ID: ${params.id}`, await response.text())
          showAlert({
            type: "error",
            message: `Transaksi dengan ID ${params.id} tidak ditemukan. Silakan periksa kembali ID transaksi Anda.`,
          })

          // Redirect to home after a delay
          setTimeout(() => {
            router.push("/")
          }, 5000)
        }
      } catch (error) {
        console.error("Error fetching transaction:", error)
        showAlert({
          type: "error",
          message: "Terjadi kesalahan saat mengambil data transaksi",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransaction()
  }, [params.id])

  const updateTransactionFee = async (transactionId: string, fee: number) => {
    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fee }),
      })

      if (!response.ok) {
        console.error("Failed to update transaction fee:", await response.text())
      }
    } catch (error) {
      console.error("Error updating transaction fee:", error)
    }
  }

  // Perbaiki fungsi createQris untuk mengirim transactionId dan mencegah pembuatan duplikat

  const createQris = async (amount: number, transactionId: string) => {
    try {
      setIsLoading(true)

      // Periksa apakah transaksi sudah memiliki data QRIS
      const checkResponse = await fetch(`/api/transactions/${transactionId}?t=${Date.now()}`)
      if (checkResponse.ok) {
        const transactionData = await checkResponse.json()
        if (transactionData.qrisData) {
          // Gunakan QRIS yang sudah ada
          setQrisData(transactionData.qrisData)
          setTransactionId(transactionData.qrisData.result.transactionId)

          // Pastikan fee diambil dari data transaksi yang ada
          if (transactionData.fee) {
            setFee(transactionData.fee)
          }

          setIsLoading(false)
          return
        }

        // Jika transaksi sudah memiliki fee tapi belum memiliki QRIS
        if (transactionData.fee) {
          setFee(transactionData.fee)
        }
      }

      // Pastikan fee sudah ditetapkan sebelum membuat QRIS
      const currentFee = fee || Math.floor(Math.random() * 6) + 5
      if (!fee) {
        setFee(currentFee)
        // Update fee di database
        await updateTransactionFee(transactionId, currentFee)
      }

      const totalAmount = amount + currentFee
      console.log(`Creating QRIS with amount: ${amount}, fee: ${currentFee}, total: ${totalAmount}`)

      const response = await fetch("/api/create-qris", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: totalAmount,
          codeqr:
            "00020101021226670016COM.NOBUBANK.WWW01189360050300000879140214137226078776130303UMI51440014ID.CO.QRIS.WWW0215ID20232946906310303UMI5204481253033605802ID5918ZAKICELL%20OK13566196005SOLOK61052731162070703A016304B61D",
          transactionId: transactionId, // Kirim transactionId untuk validasi
        }),
      })

      const data = await response.json()

      if (data.success) {
        setQrisData(data)
        const qrisTransactionId = data.result.transactionId
        setTransactionId(qrisTransactionId)
        localStorage.setItem("zkygame_transactionId", qrisTransactionId)

        await updateTransactionQrisData(transactionId, data, qrisTransactionId)
      } else {
        console.error("Failed to create QRIS:", data)
        showAlert({ type: "error", message: "Gagal membuat kode QRIS" })
      }
    } catch (error) {
      console.error("Error creating QRIS:", error)
      showAlert({ type: "error", message: "Terjadi kesalahan saat membuat kode QRIS" })
    } finally {
      setIsLoading(false)
    }
  }

  const updateTransactionQrisData = async (
    transactionId: string,
    qrisData: QrisResponse,
    qrisTransactionId: string,
  ) => {
    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrisData,
          transactionId: qrisTransactionId,
          qrisTransactionId: qrisTransactionId,
        }),
      })

      if (!response.ok) {
        console.error("Failed to update transaction QR data:", await response.text())
      }
    } catch (error) {
      console.error("Error updating transaction QR data:", error)
    }
  }

  const checkPaymentStatus = useCallback(async () => {
    if (!transactionId) return

    try {
      const response = await fetch("/api/check-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merchant: "OK1356619",
          token: "399257317307325111356619OKCTA013407C630E4BF06610210F74C83B0C",
          transactionId: transactionId,
          referenceId: transaction?.referenceId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const totalAmount = transaction?.amount + fee
        console.log(`Checking payment status: Expected amount: ${totalAmount}, Received amount: ${data.result.amount}`)

        // Konversi ke string untuk perbandingan yang konsisten
        if (data.result.amount === totalAmount.toString() || data.result.amount === String(totalAmount)) {
          setPaymentStatus("success")
          await updateTransactionStatus(transaction?._id, "success")

          if (timerInterval.current) {
            clearInterval(timerInterval.current)
          }
          if (statusCheckInterval.current) {
            clearInterval(statusCheckInterval.current)
          }

          processTransaction()
        }
      }
    } catch (error) {
      console.error("Error checking payment status:", error)
    }
  }, [transactionId, transaction, fee])

  const updateTransactionStatus = async (transactionId: string, status: string) => {
    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        console.error("Failed to update transaction status:", await response.text())
      }
    } catch (error) {
      console.error("Error updating transaction status:", error)
    }
  }

  useEffect(() => {
    if (paymentStatus !== "pending") return

    timerInterval.current = window.setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1)
      } else if (minutes > 0) {
        setMinutes(minutes - 1)
        setSeconds(59)
      } else {
        if (timerInterval.current) {
          clearInterval(timerInterval.current)
        }
      }
    }, 1000)

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current)
      }
    }
  }, [minutes, seconds, paymentStatus])

  useEffect(() => {
    if (paymentStatus !== "pending" || !transactionId) return

    statusCheckInterval.current = window.setInterval(() => {
      checkPaymentStatus()
    }, 10000)

    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current)
      }
    }
  }, [checkPaymentStatus, paymentStatus, transactionId])

  const processTransaction = async () => {
    try {
      const userId = transaction?.userId || localStorage.getItem("zkygame_userId") || ""
      const selectedProduct = transaction?.productCode || localStorage.getItem("zkygame_selectedProduct") || ""

      if (!userId || !selectedProduct) {
        console.error("Missing required transaction data")
        return
      }

      const refId = transaction?.referenceId || `ZKY${Date.now().toString().substring(8)}`

      const response = await fetch("/api/process-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product: selectedProduct,
          dest: userId,
          refId: refId,
          memberID: "OK1356619",
          pin: "4152",
          password: "Zaki4321",
        }),
      })

      const data = await response.json()

      if (data.success) {
        console.log("Transaction processing started:", data.message)
        localStorage.setItem("zkygame_refId", refId)
        setTimeout(() => checkTransactionStatus(selectedProduct, userId, refId), 5000)
      } else {
        console.error("Failed to process transaction:", data.error)
        showAlert({ type: "error", message: "Gagal memproses transaksi" })
      }
    } catch (error) {
      console.error("Error processing transaction:", error)
      showAlert({ type: "error", message: "Terjadi kesalahan saat memproses transaksi" })
    }
  }

  const checkTransactionStatus = async (product: string, dest: string, refId: string) => {
    try {
      const response = await fetch("/api/check-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product: product,
          dest: dest,
          refId: refId,
          memberID: "OK1356619",
          pin: "4152",
          password: "Zaki4321",
        }),
      })

      const data = await response.json()

      if (data.success) {
        console.log("Transaction status:", data.status)
        console.log("Serial Number:", data.serialNumber)

        if (data.status.toLowerCase() === "sukses") {
          console.log("Transaction completed successfully!")
        } else {
          setTimeout(() => checkTransactionStatus(product, dest, refId), 5000)
        }
      } else {
        console.error("Failed to check transaction status:", data.error)
      }
    } catch (error) {
      console.error("Error checking transaction status:", error)
    }
  }

  const formatTime = (value: number) => {
    return value < 10 ? `0${value}` : value
  }

  const handleDownloadQris = () => {
    if (qrisData?.result?.qrImageUrl) {
      const link = document.createElement("a")
      link.href = qrisData.result.qrImageUrl
      link.download = "qris.png"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleCancelInvoice = async () => {
    try {
      await updateTransactionStatus(transaction?._id, "cancelled")
      setPaymentStatus("cancelled")

      if (timerInterval.current) {
        clearInterval(timerInterval.current)
      }
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current)
      }

      setTimeout(() => {
        router.push("/")
      }, 3000)

      showAlert({ type: "success", message: "Pembayaran berhasil dibatalkan" })
    } catch (error) {
      console.error("Error cancelling invoice:", error)
      showAlert({ type: "error", message: "Gagal membatalkan pembayaran" })
    }

    setIsCancelDialogOpen(false)
  }

  const amount = transaction?.amount || 0
  const totalAmount = amount + fee

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 border-b">
        <Link href="/" className="inline-block">
          <X className="h-6 w-6" />
        </Link>
      </header>

      <main className="flex-1 container max-w-md mx-auto py-8 px-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="mt-4 text-muted-foreground">Memuat data transaksi...</p>
          </div>
        ) : paymentStatus === "success" ? (
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Pembayaran Berhasil</h1>
            <p className="text-center text-muted-foreground mb-4">
              Terima kasih atas pembayaran Anda. Pesanan sedang diproses.
            </p>
            <div className="w-full p-4 bg-green-50 rounded-lg border border-green-200 mb-6">
              <p className="text-sm text-green-800">
                Token akan segera dikirim ke akun game Anda. Proses ini biasanya membutuhkan waktu 1-5 menit.
              </p>
            </div>
            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6"
              onClick={() => router.push("/")}
            >
              KEMBALI KE BERANDA
            </Button>
          </div>
        ) : paymentStatus === "cancelled" ? (
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Pembayaran Dibatalkan</h1>
            <p className="text-center text-muted-foreground mb-4">Anda telah membatalkan transaksi ini.</p>
            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6"
              onClick={() => router.push("/")}
            >
              KEMBALI KE BERANDA
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center mb-8">
              {isLoading ? (
                <div className="w-64 h-64 bg-white p-2 rounded-lg mb-6 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                </div>
              ) : qrisData?.result?.qrImageUrl ? (
                <div className="w-64 h-64 bg-white p-2 rounded-lg mb-6">
                  <Image
                    src={qrisData.result.qrImageUrl || "/placeholder.svg"}
                    alt="QR Code"
                    width={240}
                    height={240}
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-64 h-64 bg-white p-2 rounded-lg mb-6">
                  <Image
                    src="/placeholder.svg?height=240&width=240"
                    alt="QR Code"
                    width={240}
                    height={240}
                    className="w-full h-full"
                  />
                </div>
              )}

              <h1 className="text-2xl font-bold mb-2">Selesaikan Pembayaran</h1>
              <p className="text-center text-muted-foreground mb-4">
                Scan atau simpan QRIS untuk melanjutkan pembayaran kamu dalam waktu
              </p>

              <div className="flex items-center text-red-600 font-bold">
                <Clock className="mr-2 h-5 w-5" />
                <span className="text-xl">
                  {formatTime(minutes)} Menit : {formatTime(seconds)} Detik
                </span>
              </div>
            </div>

            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-lg font-medium mb-4">DETAIL PEMBAYARAN</h2>

                <div className="flex items-center mb-6">
                  <div className="w-16">
                    <Image
                      src="/placeholder.svg?height=40&width=40"
                      alt="QRIS"
                      width={40}
                      height={40}
                      className="w-full"
                    />
                  </div>
                  <span className="text-lg font-medium">QRIS</span>
                </div>

                <Separator className="mb-4" />

                <div className="space-y-4">
                  <div>
                    <h3 className="text-muted-foreground">NOMINAL TRANSAKSI</h3>
                    <p className="text-xl font-bold">Rp{amount.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.")}</p>
                  </div>

                  <div>
                    <h3 className="text-muted-foreground">BIAYA ADMIN</h3>
                    <p className="text-xl font-bold">Rp{fee}</p>
                  </div>

                  <Separator className="my-2" />

                  <div>
                    <h3 className="text-muted-foreground">TOTAL TRANSAKSI</h3>
                    <p className="text-2xl font-bold text-red-600">
                      Rp{totalAmount.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <h2 className="text-xl font-medium">Cara Pembayaran dengan QRIS</h2>

              <ol className="list-decimal list-inside space-y-4 text-muted-foreground">
                <li>Unduh kode QRIS kamu</li>
                <li>
                  Buka aplikasi pembayaran kamu. Dapat dilakukan pembayaran melalui aplikasi LinkAja, Dana, OVO, GoPay,
                  m-Banking
                </li>
                <li>Scan QR Code atau upload QR Code yang telah diunduh</li>
                <li>Tombol "Cek Status Pembayaran" untuk memperbarui status pembayaran</li>
              </ol>

              <div className="flex flex-col gap-3">
                <Button
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6"
                  onClick={handleDownloadQris}
                  disabled={!qrisData?.result?.qrImageUrl}
                >
                  UNDUH QRIS
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-red-600 text-red-600 hover:bg-red-600/10 hover:text-red-600 font-bold py-6"
                  onClick={checkPaymentStatus}
                >
                  CEK STATUS PEMBAYARAN
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-red-600 text-red-600 hover:bg-red-600/10 hover:text-red-600 font-bold py-6"
                  onClick={() => setIsCancelDialogOpen(true)}
                >
                  BATALKAN PEMBAYARAN
                </Button>
              </div>
            </div>
          </>
        )}
      </main>

      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan Pembayaran</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin membatalkan pembayaran ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row justify-end space-x-2">
            <AlertDialogCancel>Tidak, Lanjutkan Pembayaran</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelInvoice} className="bg-red-600 hover:bg-red-700">
              Ya, Batalkan Pembayaran
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

