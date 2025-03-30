"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Users, CreditCard, Calendar, ArrowUpRight, DollarSign, RefreshCw } from "lucide-react"

export function AdminDashboardContent() {
  const [timeRange, setTimeRange] = useState("week")
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalTransactions: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)

        const response = await fetch("/api/admin/dashboard")
        if (response.ok) {
          const data = await response.json()
          setStats({
            totalRevenue: data.totalRevenue || 0,
            totalOrders: data.totalOrders || 0,
            totalUsers: data.totalUsers || 0,
            totalTransactions: data.totalTransactions || 0,
          })
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [timeRange])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Selamat datang kembali, Admin!</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-9">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Filter</span>
          </Button>
          <Button size="sm" variant="outline" className="h-9">
            <RefreshCw className="mr-2 h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button size="sm" className="h-9">
            <DollarSign className="mr-2 h-4 w-4" />
            <span>Laporan</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-primary/5">
                <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">
                  {isLoading ? "Loading..." : `Rp ${stats.totalRevenue.toLocaleString("id-ID")}`}
                </div>
                <div className="flex items-center pt-1 text-xs">
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">+20.1%</span>
                  <span className="ml-1 text-muted-foreground">dari bulan lalu</span>
                </div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-primary/5">
                <CardTitle className="text-sm font-medium">Pesanan</CardTitle>
                <ShoppingCart className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{isLoading ? "Loading..." : `+${stats.totalOrders}`}</div>
                <div className="flex items-center pt-1 text-xs">
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">+12.4%</span>
                  <span className="ml-1 text-muted-foreground">dari bulan lalu</span>
                </div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-primary/5">
                <CardTitle className="text-sm font-medium">Pengguna</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{isLoading ? "Loading..." : `+${stats.totalUsers}`}</div>
                <div className="flex items-center pt-1 text-xs">
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">+10.1%</span>
                  <span className="ml-1 text-muted-foreground">dari bulan lalu</span>
                </div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-primary/5">
                <CardTitle className="text-sm font-medium">Transaksi</CardTitle>
                <CreditCard className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{isLoading ? "Loading..." : `+${stats.totalTransactions}`}</div>
                <div className="flex items-center pt-1 text-xs">
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">+18.7%</span>
                  <span className="ml-1 text-muted-foreground">dari bulan lalu</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium">Analytics Content</h3>
            <p className="text-muted-foreground">Konten analytics akan ditampilkan di sini.</p>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium">Reports Content</h3>
            <p className="text-muted-foreground">Konten laporan akan ditampilkan di sini.</p>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium">Notifications Content</h3>
            <p className="text-muted-foreground">Konten notifikasi akan ditampilkan di sini.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

