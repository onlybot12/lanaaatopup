"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Eye, ArrowUpDown, Clock, CheckCircle, XCircle } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { format } from "date-fns"
import { AdminAuthWrapper } from "@/components/admin/admin-auth-wrapper"
import { useAlert } from "@/components/custom-alert"

export default function InvoicePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [viewingInvoice, setViewingInvoice] = useState<any | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [trackingId, setTrackingId] = useState("")
  const [trackingResult, setTrackingResult] = useState<any | null>(null)
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false)
  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showAlert } = useAlert()

  const pageSize = 10

  useEffect(() => {
    // Ambil daftar invoice dari database
    const fetchInvoices = async () => {
      setIsLoading(true)
      try {
        // Tambahkan timestamp untuk menghindari cache
        const timestamp = new Date().getTime()
        const response = await fetch(`/api/transactions?t=${timestamp}`)
        if (response.ok) {
          const data = await response.json()
          setInvoices(data)
        } else {
          console.error("Failed to fetch invoices:", await response.text())
          showAlert({ type: "error", message: "Gagal mengambil data invoice" })
        }
      } catch (error) {
        console.error("Error fetching invoices:", error)
        showAlert({ type: "error", message: "Terjadi kesalahan saat mengambil data invoice" })
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvoices()
  }, [])

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      (invoice.referenceId && invoice.referenceId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (invoice.transactionId && invoice.transactionId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (invoice.userId && invoice.userId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (invoice.email && invoice.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (invoice.productCode && invoice.productCode.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const totalPages = Math.ceil(filteredInvoices.length / pageSize)

  const handleViewInvoice = (invoice: any) => {
    setViewingInvoice(invoice)
    setIsViewDialogOpen(true)
  }

  const handleTrackInvoice = async () => {
    if (!trackingId) return

    setIsLoading(true)
    try {
      // Tambahkan timestamp untuk menghindari cache
      const timestamp = new Date().getTime()
      const response = await fetch(
        `/api/transactions?referenceId=${trackingId}&transactionId=${trackingId}&t=${timestamp}`,
      )

      if (response.ok) {
        const data = await response.json()
        setTrackingResult(data)
      } else {
        setTrackingResult(null)
        showAlert({ type: "error", message: "Invoice tidak ditemukan" })
      }
    } catch (error) {
      console.error("Error tracking invoice:", error)
      setTrackingResult(null)
      showAlert({ type: "error", message: "Terjadi kesalahan saat melacak invoice" })
    } finally {
      setIsLoading(false)
      setIsTrackingDialogOpen(true)
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
      case "cancelled":
        return "bg-red-500/20 text-red-700 dark:text-red-500"
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 mr-1" />
      case "success":
        return <CheckCircle className="h-4 w-4 mr-1" />
      case "failed":
        return <XCircle className="h-4 w-4 mr-1" />
      case "cancelled":
        return <XCircle className="h-4 w-4 mr-1" />
      default:
        return null
    }
  }

  return (
    <AdminAuthWrapper>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">Kelola dan lacak semua invoice transaksi</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => setIsTrackingDialogOpen(true)}>
              <Search className="h-4 w-4 mr-2" />
              Lacak Invoice
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Daftar Invoice</CardTitle>
                <CardDescription>Kelola semua invoice dalam sistem</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative w-full md:w-[250px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari invoice..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[15%]">
                      <div className="flex items-center">
                        Invoice ID
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="w-[15%]">Pengguna</TableHead>
                    <TableHead className="w-[15%]">Produk</TableHead>
                    <TableHead className="w-[15%]">
                      <div className="flex items-center">
                        Tanggal
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="w-[15%]">
                      <div className="flex items-center">
                        Jumlah
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="w-[15%]">Status</TableHead>
                    <TableHead className="w-[10%] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInvoices.length > 0 ? (
                    paginatedInvoices.map((invoice) => (
                      <TableRow key={invoice._id}>
                        <TableCell className="font-medium">{invoice.referenceId || invoice.transactionId}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{invoice.userId}</span>
                            {invoice.email && <span className="text-xs text-muted-foreground">{invoice.email}</span>}
                          </div>
                        </TableCell>
                        <TableCell>{invoice.productCode || "-"}</TableCell>
                        <TableCell>{format(new Date(invoice.createdAt), "dd MMM yyyy")}</TableCell>
                        <TableCell className="font-medium">Rp {invoice.amount?.toLocaleString("id-ID")}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`flex w-24 items-center justify-center ${getStatusColor(invoice.status)}`}
                          >
                            {getStatusIcon(invoice.status)}
                            <span>{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleViewInvoice(invoice)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-muted-foreground">Tidak ada invoice yang ditemukan</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Menampilkan {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, filteredInvoices.length)} dari {filteredInvoices.length} invoice
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
                          <PaginationLink isActive={currentPage === page} onClick={() => setCurrentPage(page)}>
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
          </CardContent>
        </Card>

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
                    {getStatusIcon(viewingInvoice.status)}
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
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    <Eye className="mr-2 h-4 w-4" />
                    Lihat Transaksi
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isTrackingDialogOpen} onOpenChange={setIsTrackingDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Lacak Invoice</DialogTitle>
              <DialogDescription>
                Masukkan ID invoice atau nomor invoice untuk melacak status pembayaran
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="tracking-id">Invoice ID / Nomor Invoice</Label>
                <div className="flex gap-2">
                  <Input
                    id="tracking-id"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="INV-123456789 atau LAN123456"
                  />
                  <Button onClick={handleTrackInvoice} className="bg-red-600 hover:bg-red-700 text-white">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {trackingResult ? (
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-medium">{trackingResult.referenceId || trackingResult.transactionId}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(trackingResult.createdAt), "dd MMMM yyyy, HH:mm")}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`flex items-center justify-center ${getStatusColor(trackingResult.status)}`}
                    >
                      {getStatusIcon(trackingResult.status)}
                      <span>{trackingResult.status.charAt(0).toUpperCase() + trackingResult.status.slice(1)}</span>
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Customer:</span>
                      <span>{trackingResult.userId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Product:</span>
                      <span>{trackingResult.productCode || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">Rp {trackingResult.amount?.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span>QRIS</span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => {
                        setViewingInvoice(trackingResult)
                        setIsTrackingDialogOpen(false)
                        setIsViewDialogOpen(true)
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Detail Invoice
                    </Button>
                  </div>
                </div>
              ) : trackingId && !isLoading ? (
                <div className="text-center p-4 border rounded-lg">
                  <XCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
                  <p className="font-medium">Invoice tidak ditemukan</p>
                  <p className="text-sm text-muted-foreground">
                    Pastikan ID atau nomor invoice yang Anda masukkan benar
                  </p>
                </div>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminAuthWrapper>
  )
}

