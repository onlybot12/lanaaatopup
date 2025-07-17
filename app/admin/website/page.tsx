"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Globe,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Save,
  Eye,
  EyeOff,
  Image,
  Plus,
  Trash2,
  Pencil,
  AlertCircle,
} from "lucide-react"
import { uploadFileToCDN } from "@/lib/upload"
import { AdminAuthWrapper } from "@/components/admin/admin-auth-wrapper"
import { useAlert } from "@/components/custom-alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface WebsiteSettings {
  _id?: string
  siteName: string
  siteUrl: string
  description: string
  keywords: string
  maintenanceMode: boolean
  logo?: string
  favicon?: string
  contact: {
    email: string
    phone: string
    address: string
    whatsapp: string
    hours: {
      weekday: string
      weekend: string
      is24Hours: boolean
    }
  }
  social: {
    facebook: string
    instagram: string
    twitter: string
    youtube: string
  }
  appearance: {
    primaryColor: string
    secondaryColor: string
    darkModeDefault: boolean
    allowThemeSwitch: boolean
  }
  footer: {
    text: string
    showPaymentIcons: boolean
    showSocialIcons: boolean
  }
  okeconnect: {
    apiUrl: string
    apiKey: string
    merchantId: string
    pin: string
    password: string
    qrisCode: string
    callbackUrl: string
    markup: number
    autoUpdate: boolean
    updateInterval: number
  }
  slides?: Array<{
    id: string
    title: string
    description: string
    image: string
    link?: string
    active: boolean
  }>
}

interface SlideData {
  id: string
  title: string
  description: string
  image: string
  link?: string
  active: boolean
}

export default function WebsiteSettings() {
  const [saving, setSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showMerchantId, setShowMerchantId] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [settings, setSettings] = useState<WebsiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSlideImage, setSelectedSlideImage] = useState<string | null>(null)
  const [isAddSlideDialogOpen, setIsAddSlideDialogOpen] = useState(false)
  const [isEditSlideDialogOpen, setIsEditSlideDialogOpen] = useState(false)
  const [isDeleteSlideDialogOpen, setIsDeleteSlideDialogOpen] = useState(false)
  const [selectedSlide, setSelectedSlide] = useState<SlideData | null>(null)
  const [newSlide, setNewSlide] = useState<SlideData>({
    id: Date.now().toString(),
    title: "",
    description: "",
    image: "",
    link: "",
    active: true,
  })
  const [hostIp, setHostIp] = useState<string>("")

  const { showAlert } = useAlert()

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const timestamp = new Date().getTime()
        const response = await fetch(`/api/settings?t=${timestamp}`)
        if (response.ok) {
          const data = await response.json()
          if (!data.slides) {
            data.slides = []
          }

          // Kosongkan data okeconnect
          if (data.okeconnect) {
            data.okeconnect = {
              apiUrl: "",
              apiKey: "",
              merchantId: "",
              pin: "",
              password: "",
              qrisCode: "",
              callbackUrl: "",
              markup: 0,
              autoUpdate: false,
              updateInterval: 6,
            }
          }

          setSettings(data)
        } else {
          console.error("Failed to fetch settings:", await response.text())
          setSettings(getDefaultSettings())
          showAlert({ type: "error", message: "Gagal mengambil pengaturan website" })
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
        setSettings(getDefaultSettings())
        showAlert({ type: "error", message: "Terjadi kesalahan saat mengambil pengaturan" })
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()

    // Dapatkan IP host
    fetch("https://api.ipify.org?format=json")
      .then((response) => response.json())
      .then((data) => setHostIp(data.ip))
      .catch((error) => console.error("Error fetching IP:", error))
  }, [])

  const handleSave = async () => {
    if (!settings) return

    setSaving(true)
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      showAlert({ type: "success", message: "Pengaturan berhasil disimpan" })
    } catch (error) {
      console.error("Error saving settings:", error)
      showAlert({ type: "error", message: "Gagal menyimpan pengaturan" })
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "logo" | "favicon") => {
    if (!e.target.files || !e.target.files[0] || !settings) return

    const file = e.target.files[0]
    try {
      const url = await uploadFileToCDN(file)
      setSettings({
        ...settings,
        [field]: url,
      })
      showAlert({ type: "success", message: `${field === "logo" ? "Logo" : "Favicon"} berhasil diunggah` })
    } catch (error) {
      console.error(`Error uploading ${field}:`, error)
      showAlert({ type: "error", message: `Gagal mengunggah ${field}` })
    }
  }

  const handleSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return

    const file = e.target.files[0]
    try {
      const url = await uploadFileToCDN(file)
      setSelectedSlideImage(url)

      if (isEditSlideDialogOpen && selectedSlide) {
        setSelectedSlide({
          ...selectedSlide,
          image: url,
        })
      } else {
        setNewSlide({
          ...newSlide,
          image: url,
        })
      }

      showAlert({ type: "success", message: "Gambar slide berhasil diunggah" })
    } catch (error) {
      console.error("Error uploading slide image:", error)
      showAlert({ type: "error", message: "Gagal mengunggah gambar slide" })
    }
  }

  const updateSetting = (path: string, value: any) => {
    if (!settings) return

    const pathParts = path.split(".")
    const newSettings = { ...settings }

    let current: any = newSettings
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]]
    }

    current[pathParts[pathParts.length - 1]] = value
    setSettings(newSettings)
  }

  const handleAddSlide = () => {
    if (!settings || !newSlide.title || !newSlide.image) {
      showAlert({ type: "error", message: "Judul dan gambar slide harus diisi" })
      return
    }

    const updatedSlides = [...(settings.slides || []), newSlide]
    setSettings({
      ...settings,
      slides: updatedSlides,
    })

    setIsAddSlideDialogOpen(false)
    setNewSlide({
      id: Date.now().toString(),
      title: "",
      description: "",
      image: "",
      link: "",
      active: true,
    })
    setSelectedSlideImage(null)

    showAlert({ type: "success", message: "Slide berhasil ditambahkan" })
  }

  const handleEditSlide = () => {
    if (!settings || !selectedSlide) return

    const updatedSlides = settings.slides?.map((slide) => (slide.id === selectedSlide.id ? selectedSlide : slide)) || []

    setSettings({
      ...settings,
      slides: updatedSlides,
    })

    setIsEditSlideDialogOpen(false)
    setSelectedSlide(null)
    setSelectedSlideImage(null)

    showAlert({ type: "success", message: "Slide berhasil diperbarui" })
  }

  const handleDeleteSlide = () => {
    if (!settings || !selectedSlide) return

    const updatedSlides = settings.slides?.filter((slide) => slide.id !== selectedSlide.id) || []

    setSettings({
      ...settings,
      slides: updatedSlides,
    })

    setIsDeleteSlideDialogOpen(false)
    setSelectedSlide(null)

    showAlert({ type: "success", message: "Slide berhasil dihapus" })
  }

  if (loading) {
    return (
      <AdminAuthWrapper>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Memuat pengaturan...</span>
        </div>
      </AdminAuthWrapper>
    )
  }

  if (!settings) {
    return (
      <AdminAuthWrapper>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Gagal memuat pengaturan</h2>
            <p className="text-muted-foreground mb-4">Terjadi kesalahan saat memuat pengaturan website.</p>
            <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
          </div>
        </div>
      </AdminAuthWrapper>
    )
  }

  return (
    <AdminAuthWrapper>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pengaturan Website</h1>
            <p className="text-muted-foreground">Kelola pengaturan website Lanastore</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white">
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
            <Save className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <ScrollArea className="w-full pb-2">
            <TabsList className="inline-flex h-10 w-auto">
              <TabsTrigger value="general">Umum</TabsTrigger>
              <TabsTrigger value="contact">Kontak</TabsTrigger>
              <TabsTrigger value="social">Sosial Media</TabsTrigger>
              <TabsTrigger value="appearance">Tampilan</TabsTrigger>
              <TabsTrigger value="slides">Slide</TabsTrigger>
              <TabsTrigger value="okeconnect">Okeconnect</TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Website</CardTitle>
                <CardDescription>Pengaturan dasar untuk website Lanastore</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="site-name">Nama Website</Label>
                    <Input
                      id="site-name"
                      value={settings.siteName}
                      onChange={(e) => updateSetting("siteName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site-url">URL Website</Label>
                    <Input
                      id="site-url"
                      value={settings.siteUrl}
                      onChange={(e) => updateSetting("siteUrl", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site-description">Deskripsi Website</Label>
                  <Textarea
                    id="site-description"
                    value={settings.description}
                    onChange={(e) => updateSetting("description", e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site-keywords">Kata Kunci (SEO)</Label>
                  <Input
                    id="site-keywords"
                    value={settings.keywords}
                    onChange={(e) => updateSetting("keywords", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Pisahkan dengan koma</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="maintenance-mode"
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => updateSetting("maintenanceMode", checked)}
                  />
                  <Label htmlFor="maintenance-mode">Mode Pemeliharaan</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Logo & Favicon</CardTitle>
                <CardDescription>Unggah logo dan favicon untuk website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo Website</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded bg-secondary flex items-center justify-center overflow-hidden">
                        {settings.logo ? (
                          <img
                            src={settings.logo || "/placeholder.svg"}
                            alt="Logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Globe className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Input id="logo" type="file" className="hidden" onChange={(e) => handleFileUpload(e, "logo")} />
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => document.getElementById("logo")?.click()}
                        >
                          Pilih Logo
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="favicon">Favicon</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center overflow-hidden">
                        {settings.favicon ? (
                          <img
                            src={settings.favicon || "/placeholder.svg"}
                            alt="Favicon"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          id="favicon"
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, "favicon")}
                        />
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => document.getElementById("favicon")?.click()}
                        >
                          Pilih Favicon
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Kontak</CardTitle>
                <CardDescription>Informasi kontak yang ditampilkan di website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        className="pl-8"
                        value={settings.contact.email}
                        onChange={(e) => updateSetting("contact.email", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <div className="relative">
                      <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        className="pl-8"
                        value={settings.contact.phone}
                        onChange={(e) => updateSetting("contact.phone", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Alamat</Label>
                  <div className="relative">
                    <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="address"
                      className="pl-8 min-h-[80px]"
                      value={settings.contact.address}
                      onChange={(e) => updateSetting("contact.address", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <div className="relative">
                    <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="whatsapp"
                      className="pl-8"
                      value={settings.contact.whatsapp}
                      onChange={(e) => updateSetting("contact.whatsapp", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Jam Operasional</CardTitle>
                <CardDescription>Jam operasional layanan pelanggan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weekday-hours">Senin - Jumat</Label>
                    <Input
                      id="weekday-hours"
                      value={settings.contact.hours.weekday}
                      onChange={(e) => updateSetting("contact.hours.weekday", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weekend-hours">Sabtu - Minggu</Label>
                    <Input
                      id="weekend-hours"
                      value={settings.contact.hours.weekend}
                      onChange={(e) => updateSetting("contact.hours.weekend", e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="24-hours"
                    checked={settings.contact.hours.is24Hours}
                    onCheckedChange={(checked) => updateSetting("contact.hours.is24Hours", checked)}
                  />
                  <Label htmlFor="24-hours">Layanan 24 Jam</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sosial Media</CardTitle>
                <CardDescription>Link sosial media untuk website Lanastore</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <div className="relative">
                      <Facebook className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="facebook"
                        className="pl-8"
                        value={settings.social.facebook}
                        onChange={(e) => updateSetting("social.facebook", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <div className="relative">
                      <Instagram className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="instagram"
                        className="pl-8"
                        value={settings.social.instagram}
                        onChange={(e) => updateSetting("social.instagram", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <div className="relative">
                      <Twitter className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="twitter"
                        className="pl-8"
                        value={settings.social.twitter}
                        onChange={(e) => updateSetting("social.twitter", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <div className="relative">
                      <Youtube className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="youtube"
                        className="pl-8"
                        value={settings.social.youtube}
                        onChange={(e) => updateSetting("social.youtube", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tampilan Website</CardTitle>
                <CardDescription>Pengaturan tampilan untuk website Lanastore</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Warna Utama</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        id="primary-color-picker"
                        value={settings.appearance.primaryColor}
                        onChange={(e) => updateSetting("appearance.primaryColor", e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <Input
                        id="primary-color"
                        value={settings.appearance.primaryColor}
                        onChange={(e) => updateSetting("appearance.primaryColor", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary-color">Warna Sekunder</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        id="secondary-color-picker"
                        value={settings.appearance.secondaryColor}
                        onChange={(e) => updateSetting("appearance.secondaryColor", e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <Input
                        id="secondary-color"
                        value={settings.appearance.secondaryColor}
                        onChange={(e) => updateSetting("appearance.secondaryColor", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="dark-mode-default"
                    checked={settings.appearance.darkModeDefault}
                    onCheckedChange={(checked) => updateSetting("appearance.darkModeDefault", checked)}
                  />
                  <Label htmlFor="dark-mode-default">Dark Mode sebagai Default</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allow-theme-switch"
                    checked={settings.appearance.allowThemeSwitch}
                    onCheckedChange={(checked) => updateSetting("appearance.allowThemeSwitch", checked)}
                  />
                  <Label htmlFor="allow-theme-switch">Izinkan Pengguna Mengganti Tema</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Footer</CardTitle>
                <CardDescription>Pengaturan footer website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="footer-text">Teks Footer</Label>
                  <Input
                    id="footer-text"
                    value={settings.footer.text}
                    onChange={(e) => updateSetting("footer.text", e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-payment-icons"
                    checked={settings.footer.showPaymentIcons}
                    onCheckedChange={(checked) => updateSetting("footer.showPaymentIcons", checked)}
                  />
                  <Label htmlFor="show-payment-icons">Tampilkan Ikon Pembayaran</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-social-icons"
                    checked={settings.footer.showSocialIcons}
                    onCheckedChange={(checked) => updateSetting("footer.showSocialIcons", checked)}
                  />
                  <Label htmlFor="show-social-icons">Tampilkan Ikon Sosial Media</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="slides" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Slide Carousel</CardTitle>
                  <CardDescription>Kelola slide yang ditampilkan di halaman utama</CardDescription>
                </div>
                <Button
                  onClick={() => setIsAddSlideDialogOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Slide
                </Button>
              </CardHeader>
              <CardContent>
                {settings.slides && settings.slides.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Gambar</TableHead>
                        <TableHead>Judul</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {settings.slides.map((slide) => (
                        <TableRow key={slide.id}>
                          <TableCell>
                            <div className="h-12 w-20 rounded bg-secondary overflow-hidden">
                              {slide.image ? (
                                <img
                                  src={slide.image || "/placeholder.svg"}
                                  alt={slide.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Image className="h-6 w-6 m-auto opacity-50" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{slide.title}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{slide.description}</TableCell>
                          <TableCell>
                            <div
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                slide.active
                                  ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400"
                              }`}
                            >
                              {slide.active ? "Aktif" : "Nonaktif"}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedSlide(slide)
                                  setSelectedSlideImage(slide.image)
                                  setIsEditSlideDialogOpen(true)
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                                onClick={() => {
                                  setSelectedSlide(slide)
                                  setIsDeleteSlideDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Image className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-semibold">Belum ada slide</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Tambahkan slide untuk ditampilkan di halaman utama website.
                    </p>
                    <Button onClick={() => setIsAddSlideDialogOpen(true)} className="mt-4">
                      Tambah Slide
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="okeconnect" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Integrasi Okeconnect</CardTitle>
                <CardDescription>Konfigurasi API Okeconnect untuk layanan topup</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  <AlertDescription className="text-blue-800 dark:text-blue-300">
                    Untuk menggunakan layanan Okeconnect, Anda perlu menambahkan IP server Anda (
                    {hostIp || "loading..."}) ke whitelist Okeconnect. Silakan hubungi dukungan Okeconnect untuk
                    menambahkan IP ini.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="okeconnect-api-url">URL API</Label>
                    <Input
                      id="okeconnect-api-url"
                      value={settings.okeconnect.apiUrl}
                      onChange={(e) => updateSetting("okeconnect.apiUrl", e.target.value)}
                      placeholder="https://okeconnect.com/harga/json?id=your_id"
                    />
                    <p className="text-xs text-muted-foreground">URL API untuk mengambil data produk dari Okeconnect</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="okeconnect-api-key">API Key</Label>
                    <div className="relative">
                      <Input
                        id="okeconnect-api-key"
                        type={showApiKey ? "text" : "password"}
                        value={settings.okeconnect.apiKey}
                        onChange={(e) => updateSetting("okeconnect.apiKey", e.target.value)}
                        placeholder="Masukkan API Key Okeconnect"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Kunci API untuk autentikasi dengan layanan Okeconnect
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="okeconnect-merchant-id">Merchant ID</Label>
                    <div className="relative">
                      <Input
                        id="okeconnect-merchant-id"
                        type={showMerchantId ? "text" : "password"}
                        value={settings.okeconnect.merchantId}
                        onChange={(e) => updateSetting("okeconnect.merchantId", e.target.value)}
                        placeholder="Masukkan Merchant ID"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowMerchantId(!showMerchantId)}
                      >
                        {showMerchantId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="okeconnect-pin">PIN</Label>
                    <div className="relative">
                      <Input
                        id="okeconnect-pin"
                        type={showPin ? "text" : "password"}
                        value={settings.okeconnect.pin}
                        onChange={(e) => updateSetting("okeconnect.pin", e.target.value)}
                        placeholder="Masukkan PIN"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPin(!showPin)}
                      >
                        {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">PIN untuk transaksi dengan Okeconnect</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="okeconnect-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="okeconnect-password"
                        type={showPassword ? "text" : "password"}
                        value={settings.okeconnect.password}
                        onChange={(e) => updateSetting("okeconnect.password", e.target.value)}
                        placeholder="Masukkan Password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Password untuk integrasi dengan API Okeconnect</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="okeconnect-qris-code">QRIS Code</Label>
                    <Textarea
                      id="okeconnect-qris-code"
                      className="font-mono text-xs"
                      rows={3}
                      value={settings.okeconnect.qrisCode}
                      onChange={(e) => updateSetting("okeconnect.qrisCode", e.target.value)}
                      placeholder="Masukkan kode QRIS"
                    />
                    <p className="text-xs text-muted-foreground">Kode QRIS yang digunakan untuk pembayaran</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="okeconnect-callback-url">URL Callback</Label>
                    <Input
                      id="okeconnect-callback-url"
                      value={settings.okeconnect.callbackUrl}
                      onChange={(e) => updateSetting("okeconnect.callbackUrl", e.target.value)}
                      placeholder="https://yourdomain.com/api/callback/okeconnect"
                    />
                    <p className="text-xs text-muted-foreground">
                      URL yang akan dipanggil oleh Okeconnect untuk notifikasi transaksi
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Pengaturan Harga</h3>

                  <div className="space-y-2">
                    <Label htmlFor="okeconnect-markup">Markup Harga (%)</Label>
                    <Input
                      id="okeconnect-markup"
                      type="number"
                      min="0"
                      max="100"
                      value={settings.okeconnect.markup}
                      onChange={(e) => updateSetting("okeconnect.markup", Number.parseInt(e.target.value))}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">
                      Persentase markup yang ditambahkan ke harga dasar produk
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="okeconnect-auto-update"
                      checked={settings.okeconnect.autoUpdate}
                      onCheckedChange={(checked) => updateSetting("okeconnect.autoUpdate", checked)}
                    />
                    <Label htmlFor="okeconnect-auto-update">Update Harga Otomatis</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="okeconnect-update-interval">Interval Update (jam)</Label>
                    <Input
                      id="okeconnect-update-interval"
                      type="number"
                      min="1"
                      max="24"
                      value={settings.okeconnect.updateInterval}
                      onChange={(e) => updateSetting("okeconnect.updateInterval", Number.parseInt(e.target.value))}
                      placeholder="6"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" className="gap-2">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sinkronisasi Produk
                  </Button>
                  <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleSave}>
                    Simpan Pengaturan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog untuk menambah slide */}
        <Dialog open={isAddSlideDialogOpen} onOpenChange={setIsAddSlideDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Tambah Slide Baru</DialogTitle>
              <DialogDescription>Tambahkan slide baru untuk ditampilkan di halaman utama</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="slide-title" className="text-right">
                  Judul
                </Label>
                <Input
                  id="slide-title"
                  value={newSlide.title}
                  onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="slide-description" className="text-right pt-2">
                  Deskripsi
                </Label>
                <Textarea
                  id="slide-description"
                  value={newSlide.description}
                  onChange={(e) => setNewSlide({ ...newSlide, description: e.target.value })}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="slide-link" className="text-right">
                  Link (Opsional)
                </Label>
                <Input
                  id="slide-link"
                  value={newSlide.link || ""}
                  onChange={(e) => setNewSlide({ ...newSlide, link: e.target.value })}
                  className="col-span-3"
                  placeholder="https://"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="slide-image" className="text-right">
                  Gambar
                </Label>
                <div className="col-span-3 flex items-center gap-4">
                  <div className="h-16 w-28 rounded bg-secondary flex items-center justify-center overflow-hidden">
                    {selectedSlideImage ? (
                      <img
                        src={selectedSlideImage || "/placeholder.svg"}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Image className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <Input id="slide-image" type="file" accept="image/*" onChange={handleSlideImageUpload} />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right">
                  <Label>Status</Label>
                </div>
                <div className="col-span-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="slide-active"
                      checked={newSlide.active}
                      onCheckedChange={(checked) => setNewSlide({ ...newSlide, active: checked })}
                    />
                    <Label htmlFor="slide-active">Aktif</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex flex-row justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddSlideDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleAddSlide} disabled={!newSlide.title || !selectedSlideImage}>
                Simpan Slide
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog untuk mengedit slide */}
        <Dialog open={isEditSlideDialogOpen} onOpenChange={setIsEditSlideDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Slide</DialogTitle>
              <DialogDescription>Ubah informasi slide</DialogDescription>
            </DialogHeader>
            {selectedSlide && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-slide-title" className="text-right">
                    Judul
                  </Label>
                  <Input
                    id="edit-slide-title"
                    value={selectedSlide.title}
                    onChange={(e) => setSelectedSlide({ ...selectedSlide, title: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="edit-slide-description" className="text-right pt-2">
                    Deskripsi
                  </Label>
                  <Textarea
                    id="edit-slide-description"
                    value={selectedSlide.description}
                    onChange={(e) => setSelectedSlide({ ...selectedSlide, description: e.target.value })}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-slide-link" className="text-right">
                    Link (Opsional)
                  </Label>
                  <Input
                    id="edit-slide-link"
                    value={selectedSlide.link || ""}
                    onChange={(e) => setSelectedSlide({ ...selectedSlide, link: e.target.value })}
                    className="col-span-3"
                    placeholder="https://"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-slide-image" className="text-right">
                    Gambar
                  </Label>
                  <div className="col-span-3 flex items-center gap-4">
                    <div className="h-16 w-28 rounded bg-secondary flex items-center justify-center overflow-hidden">
                      {selectedSlideImage ? (
                        <img
                          src={selectedSlideImage || "/placeholder.svg"}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Image className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <Input id="edit-slide-image" type="file" accept="image/*" onChange={handleSlideImageUpload} />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right">
                    <Label>Status</Label>
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="edit-slide-active"
                        checked={selectedSlide.active}
                        onCheckedChange={(checked) => setSelectedSlide({ ...selectedSlide, active: checked })}
                      />
                      <Label htmlFor="edit-slide-active">Aktif</Label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="flex flex-row justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditSlideDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleEditSlide}>Simpan Perubahan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog untuk menghapus slide */}
        <Dialog open={isDeleteSlideDialogOpen} onOpenChange={setIsDeleteSlideDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Hapus Slide</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus slide ini? Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            {selectedSlide && (
              <div className="py-4">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-28 rounded bg-secondary flex items-center justify-center overflow-hidden">
                    {selectedSlide.image ? (
                      <img
                        src={selectedSlide.image || "/placeholder.svg"}
                        alt={selectedSlide.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Image className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{selectedSlide.title}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                      {selectedSlide.description}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="flex flex-row justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteSlideDialogOpen(false)}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleDeleteSlide}>
                Hapus Slide
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminAuthWrapper>
  )
}

function getDefaultSettings(): WebsiteSettings {
  return {
    siteName: "Lanastore",
    siteUrl: "https://lanaaatopup.vercel.app",
    description: "Website topup murah cepat dan terpecaya di Indonesia 100% Legal.",
    keywords: "topup game, diamond murah, lanastore",
    maintenanceMode: false,
    contact: {
      email: "",
      phone: "",
      address: "",
      whatsapp: "",
      hours: {
        weekday: "",
        weekend: "",
        is24Hours: false,
      },
    },
    social: {
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: "",
    },
    appearance: {
      primaryColor: "#dc2626",
      secondaryColor: "#1e293b",
      darkModeDefault: true,
      allowThemeSwitch: true,
    },
    footer: {
      text: "© 2025 Lanastore. All rights reserved.",
      showPaymentIcons: true,
      showSocialIcons: true,
    },
    okeconnect: {
      apiUrl: "",
      apiKey: "",
      merchantId: "",
      pin: "",
      password: "",
      qrisCode: "",
      callbackUrl: "",
      markup: 0,
      autoUpdate: false,
      updateInterval: 6,
    },
    slides: [],
  }
}

