"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

export default function PopupSettings() {
  const [saving, setSaving] = useState(false)
  const [popupEnabled, setPopupEnabled] = useState(true)
  const [popupTitle, setPopupTitle] = useState("Selamat Datang di Zkygame!")
  const [popupDescription, setPopupDescription] = useState(
    "Platform top up game terpercaya dengan harga termurah dan proses instan.",
  )
  const [popupContent, setPopupContent] = useState(
    "Zkygame menyediakan layanan top up untuk berbagai game populer dengan proses yang cepat dan aman. Nikmati kemudahan bertransaksi dan harga yang kompetitif!",
  )
  const [popupBenefits, setPopupBenefits] = useState(
    "Proses instan dan otomatis\nHarga termurah\nLayanan pelanggan 24/7\nMetode pembayaran lengkap\nTransaksi aman dan terpercaya",
  )
  const [popupButtonText, setPopupButtonText] = useState("Mulai Jelajahi")
  const [popupDuration, setPopupDuration] = useState("365")

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengaturan Popup</h1>
          <p className="text-muted-foreground">
            Kelola popup yang ditampilkan saat pengunjung pertama kali mengakses website
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Pratinjau
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <div className="pt-6">
                <h2 className="text-xl font-bold mb-2">{popupTitle}</h2>
                <p className="text-sm text-muted-foreground mb-4">{popupDescription}</p>

                <div className="py-4">
                  <p className="mb-4">{popupContent}</p>

                  <div className="bg-secondary/30 p-4 rounded-lg mb-4">
                    <h3 className="font-medium mb-2">Keuntungan Menggunakan Zkygame:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {popupBenefits.split("\n").map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <div className="h-4 w-4 border rounded-sm"></div>
                    <span className="text-sm">Jangan tampilkan lagi</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>{popupButtonText}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
            <Save className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Konten</TabsTrigger>
          <TabsTrigger value="appearance">Tampilan</TabsTrigger>
          <TabsTrigger value="settings">Pengaturan</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Konten Popup</CardTitle>
              <CardDescription>Atur konten yang ditampilkan pada popup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="popup-title">Judul</Label>
                <Input id="popup-title" value={popupTitle} onChange={(e) => setPopupTitle(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="popup-description">Deskripsi Singkat</Label>
                <Input
                  id="popup-description"
                  value={popupDescription}
                  onChange={(e) => setPopupDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="popup-content">Konten Utama</Label>
                <Textarea
                  id="popup-content"
                  rows={4}
                  value={popupContent}
                  onChange={(e) => setPopupContent(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="popup-benefits">Keuntungan (Satu per baris)</Label>
                <Textarea
                  id="popup-benefits"
                  rows={5}
                  value={popupBenefits}
                  onChange={(e) => setPopupBenefits(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="popup-button">Teks Tombol</Label>
                <Input id="popup-button" value={popupButtonText} onChange={(e) => setPopupButtonText(e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tampilan Popup</CardTitle>
              <CardDescription>Atur tampilan visual popup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="popup-width">Lebar Popup (px)</Label>
                  <Input id="popup-width" type="number" defaultValue="500" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="popup-position">Posisi</Label>
                  <select
                    id="popup-position"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="center">Tengah</option>
                    <option value="top">Atas</option>
                    <option value="bottom">Bawah</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="popup-animation">Animasi</Label>
                <select
                  id="popup-animation"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="fade">Fade</option>
                  <option value="slide">Slide</option>
                  <option value="scale">Scale</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="popup-overlay">Warna Overlay</Label>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded bg-black/50" />
                  <Input id="popup-overlay" defaultValue="rgba(0, 0, 0, 0.5)" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Popup</CardTitle>
              <CardDescription>Atur perilaku dan waktu tampil popup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="popup-enabled" checked={popupEnabled} onCheckedChange={setPopupEnabled} />
                <Label htmlFor="popup-enabled">Aktifkan Popup</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="popup-delay">Delay Tampil (detik)</Label>
                <Input id="popup-delay" type="number" defaultValue="0" min="0" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="popup-duration">Durasi Cookie (hari)</Label>
                <Input
                  id="popup-duration"
                  type="number"
                  value={popupDuration}
                  onChange={(e) => setPopupDuration(e.target.value)}
                  min="1"
                />
                <p className="text-xs text-muted-foreground">
                  Berapa lama popup tidak akan ditampilkan lagi setelah pengunjung menutupnya
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="popup-mobile" defaultChecked />
                <Label htmlFor="popup-mobile">Tampilkan di Perangkat Mobile</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="popup-dontshow" defaultChecked />
                <Label htmlFor="popup-dontshow">Tampilkan Opsi "Jangan Tampilkan Lagi"</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

