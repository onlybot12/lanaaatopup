"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Clock, Download, Eye, Search, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navbar } from "@/components/navbar"
import { SiteFooter } from "@/components/site-footer"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAlert } from "@/components/custom-alert"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function InvoicePage() {
  const router = useRouter()
  const [invoiceId, setInvoiceId] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [invoiceResult, setInvoiceResult] = useState<any>(null)
  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewingInvoice, setViewingInvoice] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { showAlert } = useAlert()

  const pageSize = 10

  useEffect(() => {
    // Ambil daftar invoice terbaru
    const fetchInvoices = async () => {
      setIsLoadingInvoices(true)
      try {
        // Tambahkan timestamp untuk menghindari cache
        const timestamp = new Date().getTime()
        const response = await fetch(`/api/transactions?t=${timestamp}&limit=5`)
        if (response.ok) {
          const data = await response.json()
          // For security, mask some data in the public view
          const maskedData = data.map((invoice) => ({
            ...invoice,
            userId: invoice.userId ? maskString(invoice.userId) : "",
            email: invoice.email ? maskEmail(invoice.email) : "",
            whatsapp: invoice.whatsapp ? maskPhone(invoice.whatsapp) : "",
          }))
          setInvoices(maskedData)
        }
      } catch (error) {
        console.error("Error fetching invoices:", error)
        showAlert({ type: "error", message: "Gagal mengambil data invoice" })
      } finally {
        setIsLoadingInvoices(false)
      }
    }

    fetchInvoices()
  }, [])

  const handleTrackInvoice = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!invoiceId) {
      setError("Masukkan ID Invoice terlebih dahulu")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Tambahkan timestamp untuk menghindari cache
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/transactions?referenceId=${invoiceId}&t=${timestamp}`)

      if (response.ok) {
        const data = await response.json()
        setInvoiceResult(data)

        if (data._id) {
          router.push(`/invoice/${data._id}`)
        }
      } else {
        setError("Invoice tidak ditemukan")
      }
    } catch (error) {
      setError("Terjadi kesalahan saat melacak invoice")
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewInvoice = (invoice: any) => {
    setViewingInvoice(invoice)
    setIsViewDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-500 flex items-center gap-1 w-24 justify-center"
          >
            <Clock className="h-4 w-4 mr-1" />
            <span>Pending</span>
          </Badge>
        )
      case "success":
        return (
          <Badge
            variant="outline"
            className="bg-green-500/20 text-green-700 dark:text-green-500 flex items-center gap-1 w-24 justify-center"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            <span>Success</span>
          </Badge>
        )
      case "failed":
        return (
          <Badge
            variant="outline"
            className="bg-red-500/20 text-red-700 dark:text-red-500 flex items-center gap-1 w-24 justify-center"
          >
            <XCircle className="h-4 w-4 mr-1" />
            <span>Failed</span>
          </Badge>
        )
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-gray-500/20 text-gray-700 dark:text-gray-500 flex items-center gap-1 w-24 justify-center"
          >
            <XCircle className="h-4 w-4 mr-1" />
            <span>Cancelled</span>
          </Badge>
        )
      default:
        return (
          <Badge
            variant="outline"
            className="bg-gray-500/20 text-gray-700 dark:text-gray-500 flex items-center gap-1 w-24 justify-center"
          >
            <Clock className="h-4 w-4 mr-1" />
            <span>Unknown</span>
          </Badge>
        )
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-500"
      case "success":
        return "bg-green-500/20 text-green-700 dark:text-green-500"
      case "failed":
        return "bg-red-500/20 text-red-700 dark:text-red-500"
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-500"
    }
  }

  // Filter invoices berdasarkan status
  const filteredInvoices = invoices.filter((invoice) => {
    return statusFilter === "all" || invoice.status === statusFilter
  })

  // Pagination
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const totalPages = Math.ceil(filteredInvoices.length / pageSize)

  // Add these helper functions for masking sensitive data
  const maskString = (str) => {
    if (!str || str.length < 4) return str
    return str.substring(0, 2) + "****" + str.substring(str.length - 2)
  }

  const maskEmail = (email) => {
    if (!email || !email.includes("@")) return email
    const [username, domain] = email.split("@")
    return maskString(username) + "@" + domain
  }

  const maskPhone = (phone) => {
    if (!phone || phone.length < 6) return phone
    return phone.substring(0, 4) + "****" + phone.substring(phone.length - 2)
  }

  return (
    <>
      <Navbar />
      <main className="container py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Lacak Invoice</h1>
              <p className="text-muted-foreground">Lacak status pembayaran dan transaksi Anda</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <Search className="h-4 w-4 mr-2" />
                Lacak Invoice
              </Button>
            </div>
          </div>

          <Tabs defaultValue="track">
            <TabsList className="mb-6">
              <TabsTrigger value="track">Lacak Invoice</TabsTrigger>
              <TabsTrigger value="list">Daftar Invoice</TabsTrigger>
            </TabsList>

            <TabsContent value="track">
              <Card>
                <CardHeader>
                  <CardTitle>Lacak Status Invoice</CardTitle>
                  <CardDescription>
                    Masukkan ID invoice untuk melacak status pembayaran dan transaksi Anda
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleTrackInvoice} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoice-id">ID Invoice</Label>
                      <div className="flex gap-2">
                        <Input
                          id="invoice-id"
                          placeholder="Masukkan ID Invoice"
                          value={invoiceId}
                          onChange={(e) => setInvoiceId(e.target.value)}
                        />
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Mencari..." : "Lacak"}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">Contoh: INV-20230123456 atau ZKY12345</p>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {invoiceResult && (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-medium">{invoiceResult.referenceId}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(invoiceResult.createdAt).toLocaleString("id-ID")}
                                </p>
                              </div>
                              {getStatusBadge(invoiceResult.status)}
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">User ID</p>
                                <p>{invoiceResult.userId}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Produk</p>
                                <p>{invoiceResult.productCode}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Jumlah</p>
                                <p>Rp {invoiceResult.amount?.toLocaleString("id-ID")}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Metode Pembayaran</p>
                                <p>QRIS</p>
                              </div>
                            </div>

                            <Button className="w-full" onClick={() => router.push(`/invoice/${invoiceResult._id}`)}>
                              Lihat Detail
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="list">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle>Daftar Invoice</CardTitle>
                      <CardDescription>Daftar invoice transaksi terbaru</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative w-full md:w-[250px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Cari invoice..." className="pl-8" />
                      </div>
                      <select
                        className="h-10 w-[130px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">Semua Status</option>
                        <option value="pending">Pending</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingInvoices ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : invoices.length > 0 ? (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[15%]">Invoice ID</TableHead>
                            <TableHead className="w-[15%]">Pengguna</TableHead>
                            <TableHead className="w-[15%]">Produk</TableHead>
                            <TableHead className="w-[15%]">Tanggal</TableHead>
                            <TableHead className="w-[15%]">Jumlah</TableHead>
                            <TableHead className="w-[15%]">Status</TableHead>
                            <TableHead className="w-[10%] text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedInvoices.map((invoice) => (
                            <TableRow key={invoice._id}>
                              <TableCell className="font-medium">
                                {invoice.referenceId || invoice.transactionId}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span>{invoice.userId}</span>
                                  {invoice.email && (
                                    <span className="text-xs text-muted-foreground">{invoice.email}</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{invoice.productCode || "-"}</TableCell>
                              <TableCell>{format(new Date(invoice.createdAt), "dd MMM yyyy")}</TableCell>
                              <TableCell className="font-medium">
                                Rp {invoice.amount?.toLocaleString("id-ID")}
                              </TableCell>
                              <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleViewInvoice(invoice)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                          Menampilkan {(currentPage - 1) * pageSize + 1}-
                          {Math.min(currentPage * pageSize, filteredInvoices.length)} dari {filteredInvoices.length}{" "}
                          invoice
                        </div>
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                              />
                            </PaginationItem>
                            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                              const page =
                                currentPage <= 3
                                  ? i + 1
                                  : currentPage >= totalPages - 2
                                    ? totalPages - 4 + i
                                    : currentPage - 2 + i

                              if (page > 0 && page <= totalPages) {
                                return (
                                  <PaginationItem key={page}>
                                    <PaginationLink
                                      isActive={currentPage === page}
                                      onClick={() => setCurrentPage(page)}
                                    >
                                      {page}
                                    </PaginationLink>
                                  </PaginationItem>
                                )
                              }
                              return null
                            })}
                            <PaginationItem>
                              <PaginationNext
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">Belum ada invoice yang tersedia</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Dialog untuk melihat detail invoice */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Detail Invoice</DialogTitle>
                <DialogDescription>Informasi lengkap mengenai invoice</DialogDescription>
              </DialogHeader>
              {viewingInvoice && (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xl font-bold">{viewingInvoice.referenceId || viewingInvoice.transactionId}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(viewingInvoice.createdAt), "dd MMMM yyyy, HH:mm")}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`flex items-center justify-center ${getStatusColor(viewingInvoice.status)}`}
                    >
                      {viewingInvoice.status === "pending" && <Clock className="h-4 w-4 mr-1" />}
                      {viewingInvoice.status === "success" && <CheckCircle className="h-4 w-4 mr-1" />}
                      {viewingInvoice.status === "failed" && <XCircle className="h-4 w-4 mr-1" />}
                      {viewingInvoice.status === "cancelled" && <XCircle className="h-4 w-4 mr-1" />}
                      <span>{viewingInvoice.status.charAt(0).toUpperCase() + viewingInvoice.status.slice(1)}</span>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Customer</h3>
                      <p className="font-medium">{viewingInvoice.userId}</p>
                      {viewingInvoice.email && <p className="text-sm">{viewingInvoice.email}</p>}
                      {viewingInvoice.whatsapp && <p className="text-sm">{viewingInvoice.whatsapp}</p>}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Payment Method</h3>
                      <p className="font-medium">QRIS</p>
                    </div>
                  </div>

                  <div className="border rounded-lg">
                    <div className="p-4 border-b">
                      <h3 className="font-medium">Detail Produk</h3>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between mb-4">
                        <div>
                          <p className="font-medium">{viewingInvoice.productCode || "-"}</p>
                          <p className="text-sm text-muted-foreground">1x Item</p>
                        </div>
                        <p className="font-medium">Rp {viewingInvoice.amount?.toLocaleString("id-ID")}</p>
                      </div>
                      <div className="flex justify-between border-t pt-4">
                        <p className="font-bold">Total</p>
                        <p className="font-bold text-red-600">Rp {viewingInvoice.amount?.toLocaleString("id-ID")}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => {
                        setIsViewDialogOpen(false)
                        router.push(`/invoice/${viewingInvoice._id}`)
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Lihat Detail
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

