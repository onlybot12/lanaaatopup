"use client"

import { CardDescription } from "@/components/ui/card"
import { DialogTrigger } from "@/components/ui/dialog"
import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, Search, Package, ChevronsUpDown, Check, RefreshCw } from "lucide-react"
import { AdminAuthWrapper } from "@/components/admin/admin-auth-wrapper"
import { uploadFileToCDN } from "@/lib/upload"
import type { Type, Category, Product, ProductPackage } from "@/lib/models"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import * as LucideIcons from "lucide-react"
import { useAlert } from "@/components/custom-alert"

interface ApiProduct {
  kode: string
  keterangan: string
  produk: string
  kategori: string
  harga: string
  status: string
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState<Product>({
    name: "",
    description: "",
    publisher: "",
    category: "",
    image: "",
    popular: false,
    active: true,
    packages: [],
  })
  const [newPackage, setNewPackage] = useState<ProductPackage>({
    id: "",
    name: "",
    price: "",
  })
  const [activeTab, setActiveTab] = useState("all")
  const [activeTypeId, setActiveTypeId] = useState<string | null>(null)
  const [apiUrl, setApiUrl] = useState("https://okeconnect.com/harga/json?id=905ccd028329b0a")
  const [apiProducts, setApiProducts] = useState<ApiProduct[]>([])
  const [types, setTypes] = useState<Type[]>([])
  const [newType, setNewType] = useState({ id: "", name: "", icon: "Gamepad2" })
  const [newCategory, setNewCategory] = useState<Category>({
    id: "",
    name: "",
    typeId: "",
    count: 0,
    image: "",
    description: "",
    publisher: "",
    popular: false,
    active: true,
    popup: "",
    inputType: "text",
    inputLabel: "",
    inputPlaceholder: "",
    inputHelp: "",
  })
  const [selectedType, setSelectedType] = useState("")
  const [openTypeSelect, setOpenTypeSelect] = useState(false)
  const [openCategorySelect, setOpenCategorySelect] = useState(false)
  const [openProductSelect, setOpenProductSelect] = useState(false)
  const [selectedProductItem, setSelectedProductItem] = useState<ApiProduct | null>(null)
  const [iconType, setIconType] = useState("Gamepad2")
  const [openIconSelect, setOpenIconSelect] = useState(false)
  const [selectedProductPlans, setSelectedProductPlans] = useState<ProductPackage[]>([])
  const [isAddTypeDialogOpen, setIsAddTypeDialogOpen] = useState(false)
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false)
  const [isAddPlanDialogOpen, setIsAddPlanDialogOpen] = useState(false)
  const [newPlan, setNewPlan] = useState<ProductPackage>({ id: "", name: "", price: "" })
  const [isEditPlanDialogOpen, setIsEditPlanDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<ProductPackage | null>(null)
  const [groupedApiProducts, setGroupedApiProducts] = useState<Record<string, ApiProduct[]>>({})
  const [editCategoryValue, setEditCategoryValue] = useState("")
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [selectedCategoryImage, setSelectedCategoryImage] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isLoadingApi, setIsLoadingApi] = useState(false)
  const [selectedCategoryState, setSelectedCategoryState] = useState<Category | null>(null)

  const [isEditPackagesDialogOpen, setIsEditPackagesDialogOpen] = useState(false)
  const [selectedCategoryForPackages, setSelectedCategoryForPackages] = useState<Category | null>(null)
  const [packageList, setPackageList] = useState<ProductPackage[]>([])
  const [isDeleteTypeDialogOpen, setIsDeleteTypeDialogOpen] = useState(false)
  const [selectedTypeToDelete, setSelectedTypeToDelete] = useState<Type | null>(null)

  const [iconSearchTerm, setIconSearchTerm] = useState("")

  const { showAlert } = useAlert()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchData()
    }, 30000)

    return () => clearInterval(intervalId)
  }, [])

  const updateCategoryCounts = (categories, products) => {
    return categories.map((category) => {
      const categoryProducts = products.filter((p) => p.category === category.id)
      const packageCount = categoryProducts.reduce(
        (total, product) => total + (product.packages ? product.packages.length : 0),
        0,
      )

      return {
        ...category,
        count: packageCount,
      }
    })
  }

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const timestamp = new Date().getTime()

      const [typesResponse, categoriesResponse, productsResponse] = await Promise.all([
        fetch(`/api/types?t=${timestamp}`),
        fetch(`/api/categories?t=${timestamp}`),
        fetch(`/api/products?t=${timestamp}`),
      ])

      let typesData = []
      let categoriesData = []
      let productsData = []

      if (typesResponse.ok) {
        typesData = await typesResponse.json()
        setTypes(typesData)
      }

      if (productsResponse.ok) {
        productsData = await productsResponse.json()
        setProducts(productsData)
      }

      if (categoriesResponse.ok) {
        categoriesData = await categoriesResponse.json()

        const updatedCategories = updateCategoryCounts(categoriesData, productsData)
        setCategories(updatedCategories)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadProductsFromApi = async () => {
    setIsLoadingApi(true)
    try {
      const response = await fetch("/api/products?url=" + encodeURIComponent(apiUrl))
      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }
      const data = await response.json()

      const processedData = Array.isArray(data) ? data : []
      setApiProducts(processedData)

      const groupedProducts = processedData.reduce(
        (acc, product) => {
          const category = product.kategori ? product.kategori.toLowerCase() : "other"
          if (!acc[category]) {
            acc[category] = []
          }
          acc[category].push(product)
          return acc
        },
        {} as Record<string, ApiProduct[]>,
      )

      setGroupedApiProducts(groupedProducts)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setIsLoadingApi(false)
    }
  }

  const filteredCategories = categories
    .filter((category) => categoryFilter === "all" || category.typeId === categoryFilter)
    .filter(
      (category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.publisher && category.publisher.toLowerCase().includes(searchTerm.toLowerCase())),
    )

  const getAllLucideIcons = () => {
    const iconNames = Object.keys(LucideIcons).filter(
      (key) => typeof LucideIcons[key] === "function" && key !== "createLucideIcon" && key !== "default",
    )
    return iconNames
  }

  const getFilteredIcons = () => {
    const allIcons = getAllLucideIcons()
    if (!iconSearchTerm) return allIcons.slice(0, 50)
    return allIcons.filter((iconName) => iconName.toLowerCase().includes(iconSearchTerm.toLowerCase())).slice(0, 50)
  }

  const handleSelectApiProduct = (product: ApiProduct) => {
    if (!product) return

    try {
      setSelectedProductItem(product)

      const basePlan: ProductPackage = {
        id: Date.now().toString(),
        name: product?.keterangan || "Produk",
        price: product?.harga || "0",
        qrisPrice: product?.harga || "0",
        apiCode: product?.kode || "",
      }

      setSelectedProductPlans([...selectedProductPlans, basePlan])
    } catch (error) {
      console.error("Error selecting product:", error)
    }
  }

  const handleDeleteCategory = async () => {
    if (!selectedCategoryState || !selectedCategoryState._id) return

    try {
      const response = await fetch(`/api/categories/${selectedCategoryState._id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setCategories(categories.filter((c) => c._id !== selectedCategoryState._id))
        setIsDeleteDialogOpen(false)
      } else {
        showAlert({ type: "error", message: "Gagal menghapus kategori" })
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      showAlert({ type: "error", message: "Terjadi kesalahan saat menghapus kategori" })
    }
  }

  const handleDeleteType = async () => {
    if (!selectedTypeToDelete || !selectedTypeToDelete._id) return

    try {
      const response = await fetch(`/api/types/${selectedTypeToDelete._id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setTypes(types.filter((t) => t._id !== selectedTypeToDelete._id))
        setIsDeleteTypeDialogOpen(false)
      } else {
        showAlert({ type: "error", message: "Gagal menghapus tipe" })
      }
    } catch (error) {
      console.error("Error deleting type:", error)
      showAlert({ type: "error", message: "Terjadi kesalahan saat menghapus tipe" })
    }
  }

  const handleEdit = (category: Category) => {
    setSelectedCategoryState(category)
    setSelectedCategoryImage(category.image || null)
    setIsEditDialogOpen(true)
  }

  const handleAddType = async () => {
    if (!newType.id || !newType.name) return

    const type: Type = {
      id: newType.id,
      name: newType.name,
      icon: newType.icon,
      count: 0,
    }

    try {
      const response = await fetch("/api/types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(type),
      })

      if (response.ok) {
        const result = await response.json()
        type._id = result.id
        setTypes([...types, type])
      }
    } catch (error) {
      console.error("Error creating type:", error)
    }

    setNewType({ id: "", name: "", icon: "Gamepad2" })
    setIsAddTypeDialogOpen(false)
  }

  const handleAddCategory = async () => {
    if (!newCategory.id || !newCategory.name || !newCategory.typeId) return

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newCategory,
          image: selectedCategoryImage || "",
          count: 0,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        const addedCategory = {
          ...newCategory,
          _id: result.id,
          image: selectedCategoryImage || "",
        }
        setCategories([...categories, addedCategory])
        setIsAddCategoryDialogOpen(false)

        setNewCategory({
          id: "",
          name: "",
          typeId: "",
          count: 0,
          image: "",
          description: "",
          publisher: "",
          popular: false,
          active: true,
          popup: "",
          inputType: "text",
          inputLabel: "",
          inputPlaceholder: "",
          inputHelp: "",
        })
        setSelectedCategoryImage(null)
      } else {
        showAlert({ type: "error", message: "Gagal menambahkan kategori" })
      }
    } catch (error) {
      console.error("Error creating category:", error)
      showAlert({ type: "error", message: "Gagal menambahkan kategori" })
    }
  }

  const getIconComponent = (iconName: string) => {
    const IconComponent = LucideIcons[iconName] || LucideIcons.Gamepad2
    return <IconComponent className="h-4 w-4" />
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return

    const file = e.target.files[0]
    try {
      const url = await uploadFileToCDN(file)
      setSelectedCategoryImage(url)
    } catch (error) {
      console.error("Error uploading image:", error)
      showAlert({ type: "error", message: "Gagal mengunggah gambar" })
    }
  }

  const handleUpdateCategory = async () => {
    if (!selectedCategoryState || !selectedCategoryState._id) return

    const updatedCategory: Partial<Category> = {
      name: selectedCategoryState.name,
      description: selectedCategoryState.description,
      publisher: selectedCategoryState.publisher,
      typeId: selectedCategoryState.typeId,
      image: selectedCategoryImage || selectedCategoryState.image,
      popular: selectedCategoryState.popular,
      active: selectedCategoryState.active,
      popup: selectedCategoryState.popup,
      inputType: selectedCategoryState.inputType,
      inputLabel: selectedCategoryState.inputLabel,
      inputPlaceholder: selectedCategoryState.inputPlaceholder,
      inputHelp: selectedCategoryState.inputHelp,
    }

    try {
      const response = await fetch(`/api/categories/${selectedCategoryState._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedCategory),
      })

      if (response.ok) {
        setCategories(categories.map((c) => (c._id === selectedCategoryState._id ? { ...c, ...updatedCategory } : c)))
        setIsEditDialogOpen(false)
        showAlert({ type: "success", message: "Kategori berhasil diperbarui" })
      } else {
        showAlert({ type: "error", message: "Gagal memperbarui kategori" })
      }
    } catch (error) {
      console.error("Error updating category:", error)
      showAlert({ type: "error", message: "Terjadi kesalahan saat memperbarui kategori" })
    }
  }

  const handleEditPackages = (category: Category) => {
    setSelectedCategoryForPackages(category)

    const product = products.find((p) => p.category === category.id)

    if (product && product.packages) {
      setPackageList(product.packages)
    } else {
      setPackageList([])
    }

    setIsEditPackagesDialogOpen(true)
  }

  const handleAddPackage = () => {
    if (!newPackage.name || !newPackage.price) return

    const packageToAdd = {
      ...newPackage,
      id: newPackage.id || Date.now().toString(),
    }

    setPackageList([...packageList, packageToAdd])
    setNewPackage({
      id: "",
      name: "",
      price: "",
      apiCode: "",
    })
  }

  const handleDeletePackage = (packageId: string) => {
    setPackageList(packageList.filter((pkg) => pkg.id !== packageId))
  }

  const handleSavePackages = async () => {
    if (!selectedCategoryForPackages) return

    try {
      const product = products.find((p) => p.category === selectedCategoryForPackages.id)

      if (product && product._id) {
        const updatedProduct = {
          ...product,
          packages: packageList,
          updatedAt: new Date(),
        }

        const response = await fetch(`/api/products/${product._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedProduct),
        })

        if (response.ok) {
          setProducts(products.map((p) => (p._id === product._id ? updatedProduct : p)))
          showAlert({ type: "success", message: "Paket berhasil disimpan" })

          setTimeout(() => {
            fetchData()
          }, 500)
        } else {
          throw new Error("Gagal memperbarui produk")
        }
      } else {
        const newProduct = {
          name: selectedCategoryForPackages.name,
          description: selectedCategoryForPackages.description || "",
          publisher: selectedCategoryForPackages.publisher || "",
          category: selectedCategoryForPackages.id,
          image: selectedCategoryForPackages.image || "",
          popular: selectedCategoryForPackages.popular || false,
          active: selectedCategoryForPackages.active || true,
          packages: packageList,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newProduct),
        })

        if (response.ok) {
          const result = await response.json()
          setProducts([...products, { ...newProduct, _id: result.id }])
          showAlert({ type: "success", message: "Paket berhasil disimpan" })

          setTimeout(() => {
            fetchData()
          }, 500)
        } else {
          throw new Error("Gagal membuat produk baru")
        }
      }

      setIsEditPackagesDialogOpen(false)
    } catch (error) {
      console.error("Error saving packages:", error)
      showAlert({ type: "error", message: `Gagal menyimpan paket: ${error.message}` })
    }
  }

  return (
    <AdminAuthWrapper>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kategori</h1>
            <p className="text-muted-foreground">Kelola semua kategori produk Lanastore</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Dialog open={isAddTypeDialogOpen} onOpenChange={setIsAddTypeDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-grow md:flex-grow-0">
                  <Plus className="mr-2 h-4 w-4" /> Tambah Tipe
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Tambah Tipe Baru</DialogTitle>
                  <DialogDescription>Tambahkan tipe produk baru (Games, Voucher, dll)</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type-id" className="text-right">
                      ID
                    </Label>
                    <Input
                      id="type-id"
                      className="col-span-3"
                      value={newType.id}
                      onChange={(e) => setNewType({ ...newType, id: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type-name" className="text-right">
                      Nama
                    </Label>
                    <Input
                      id="type-name"
                      className="col-span-3"
                      value={newType.name}
                      onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type-icon" className="text-right">
                      Ikon
                    </Label>
                    <div className="col-span-3">
                      <Popover open={openIconSelect} onOpenChange={setOpenIconSelect}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openIconSelect}
                            className="w-full justify-between"
                            type="button"
                          >
                            <div className="flex items-center gap-2">
                              {getIconComponent(iconType)}
                              <span>
                                {iconType === "Gamepad2" ? "Game" : iconType === "Smartphone" ? "Voucher" : "PLN"}
                              </span>
                            </div>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder="Cari icon..."
                              value={iconSearchTerm}
                              onValueChange={setIconSearchTerm}
                            />
                            <CommandList className="max-h-[300px] overflow-y-auto">
                              <CommandEmpty>Icon tidak ditemukan.</CommandEmpty>
                              <CommandGroup>
                                {getFilteredIcons().map((iconName) => {
                                  const IconComponent = LucideIcons[iconName]
                                  return (
                                    <CommandItem
                                      key={iconName}
                                      onSelect={() => {
                                        setIconType(iconName)
                                        setNewType({ ...newType, icon: iconName })
                                        setOpenIconSelect(false)
                                        setIconSearchTerm("")
                                      }}
                                      className="flex items-center gap-2 px-4 py-2"
                                    >
                                      <IconComponent className="h-4 w-4" />
                                      <span>{iconName}</span>
                                      {iconType === iconName && <Check className="ml-auto h-4 w-4" />}
                                    </CommandItem>
                                  )
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleAddType}>
                    Simpan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 text-white flex-grow md:flex-grow-0">
                  <Plus className="mr-2 h-4 w-4" /> Tambah Kategori
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto w-[95vw] p-4 md:p-6">
                <DialogHeader>
                  <DialogTitle>Tambah Kategori Baru</DialogTitle>
                  <DialogDescription>Tambahkan kategori baru ke katalog Zkygame</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="md:text-right">
                      Tipe
                    </Label>
                    <div className="col-span-1 md:col-span-3">
                      <Popover open={openTypeSelect} onOpenChange={setOpenTypeSelect}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openTypeSelect}
                            className="w-full justify-between"
                            type="button"
                          >
                            {newCategory.typeId
                              ? types.find((type) => type.id === newCategory.typeId)?.name
                              : "Pilih Tipe"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Cari tipe..." />
                            <CommandEmpty>Tipe tidak ditemukan.</CommandEmpty>
                            <CommandList className="max-h-[200px] overflow-y-auto">
                              <CommandGroup>
                                {types.map((type) => (
                                  <CommandItem
                                    key={type.id}
                                    onSelect={() => {
                                      setNewCategory({ ...newCategory, typeId: type.id })
                                      setOpenTypeSelect(false)
                                    }}
                                    className="flex items-center gap-2 px-4 py-2"
                                  >
                                    {getIconComponent(type.icon)}
                                    <span>{type.name}</span>
                                    {newCategory.typeId === type.id && <Check className="ml-auto h-4 w-4" />}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <Label htmlFor="category-id" className="md:text-right">
                      ID Kategori
                    </Label>
                    <Input
                      id="category-id"
                      placeholder="ID Kategori (contoh: mobile-legends)"
                      className="col-span-3"
                      value={newCategory.id}
                      onChange={(e) => setNewCategory({ ...newCategory, id: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <Label htmlFor="category-name" className="md:text-right">
                      Nama Kategori
                    </Label>
                    <Input
                      id="category-name"
                      placeholder="Nama Kategori"
                      className="col-span-3"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <Label htmlFor="category-publisher" className="md:text-right">
                      Publisher
                    </Label>
                    <Input
                      id="category-publisher"
                      placeholder="Publisher"
                      className="col-span-3"
                      value={newCategory.publisher}
                      onChange={(e) => setNewCategory({ ...newCategory, publisher: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4">
                    <Label htmlFor="category-description" className="md:text-right pt-2">
                      Deskripsi
                    </Label>
                    <Textarea
                      id="category-description"
                      placeholder="Deskripsi Kategori"
                      className="col-span-3"
                      rows={3}
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4">
                    <Label htmlFor="category-popup" className="md:text-right pt-2">
                      Popup Info
                    </Label>
                    <Textarea
                      id="category-popup"
                      placeholder="Informasi penting yang akan ditampilkan dalam popup"
                      className="col-span-3"
                      rows={3}
                      value={newCategory.popup}
                      onChange={(e) => setNewCategory({ ...newCategory, popup: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <Label htmlFor="input-type" className="md:text-right">
                      Tipe Input
                    </Label>
                    <Select
                      value={newCategory.inputType || "text"}
                      onValueChange={(value) =>
                        setNewCategory({ ...newCategory, inputType: value as "text" | "number" | "email" | "tel" })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Pilih tipe input" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="tel">Telephone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <Label htmlFor="input-label" className="md:text-right">
                      Label Input
                    </Label>
                    <Input
                      id="input-label"
                      placeholder="Label untuk input (contoh: User ID, Email, dll)"
                      className="col-span-3"
                      value={newCategory.inputLabel}
                      onChange={(e) => setNewCategory({ ...newCategory, inputLabel: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <Label htmlFor="input-placeholder" className="md:text-right">
                      Placeholder Input
                    </Label>
                    <Input
                      id="input-placeholder"
                      placeholder="Placeholder untuk input"
                      className="col-span-3"
                      value={newCategory.inputPlaceholder}
                      onChange={(e) => setNewCategory({ ...newCategory, inputPlaceholder: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4">
                    <Label htmlFor="input-help" className="md:text-right pt-2">
                      Teks Bantuan Input
                    </Label>
                    <Textarea
                      id="input-help"
                      placeholder="Teks bantuan yang ditampilkan di bawah input"
                      className="col-span-3"
                      rows={2}
                      value={newCategory.inputHelp}
                      onChange={(e) => setNewCategory({ ...newCategory, inputHelp: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <Label htmlFor="category-image" className="md:text-right">
                      Gambar Kategori
                    </Label>
                    <div className="col-span-3 flex items-center gap-4">
                      <div className="h-16 w-16 rounded-md bg-secondary flex items-center justify-center overflow-hidden">
                        {selectedCategoryImage ? (
                          <img
                            src={selectedCategoryImage || "/placeholder.svg"}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <Input id="category-image" type="file" accept="image/*" onChange={handleImageUpload} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <div className="md:text-right">
                      <Label>Status</Label>
                    </div>
                    <div className="col-span-3 space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="category-active"
                          checked={newCategory.active}
                          onCheckedChange={(checked) => setNewCategory({ ...newCategory, active: checked })}
                        />
                        <Label htmlFor="category-active">Aktif</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="category-popular"
                          checked={newCategory.popular}
                          onCheckedChange={(checked) => setNewCategory({ ...newCategory, popular: checked })}
                        />
                        <Label htmlFor="category-popular">Populer</Label>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddCategoryDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleAddCategory}
                    disabled={!newCategory.id || !newCategory.name || !newCategory.typeId}
                  >
                    Simpan Kategori
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Daftar Kategori</CardTitle>
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari kategori..."
                    className="pl-8 w-full md:w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter Tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tipe</SelectItem>
                    {types.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-semibold">Tidak ada kategori</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Belum ada kategori yang ditambahkan atau tidak ada kategori yang sesuai dengan filter.
                </p>
                <Button onClick={() => setIsAddCategoryDialogOpen(true)} className="mt-4">
                  Tambah Kategori
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">No</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Produk</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category, index) => (
                      <TableRow key={category._id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center overflow-hidden">
                              {category.image ? (
                                <img
                                  src={category.image || "/placeholder.svg"}
                                  alt={category.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Package className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{category.name}</div>
                              <div className="text-xs text-muted-foreground">{category.publisher}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{types.find((t) => t.id === category.typeId)?.name || "-"}</TableCell>
                        <TableCell>{category.count || 0} produk</TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              category.active
                                ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400"
                            }`}
                          >
                            {category.active ? "Aktif" : "Nonaktif"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditPackages(category)}>
                              <Package className="h-4 w-4" />
                              <span className="sr-only">Edit Packages</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                              onClick={() => {
                                setSelectedCategoryState(category)
                                setIsDeleteDialogOpen(true)
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
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Daftar Tipe</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : types.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-semibold">Tidak ada tipe</h3>
                <p className="mt-2 text-sm text-muted-foreground">Belum ada tipe yang ditambahkan.</p>
                <Button onClick={() => setIsAddTypeDialogOpen(true)} className="mt-4">
                  Tambah Tipe
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">No</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Icon</TableHead>
                      <TableHead>Jumlah Kategori</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {types.map((type, index) => (
                      <TableRow key={type._id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div className="font-medium">{type.name}</div>
                          <div className="text-xs text-muted-foreground">{type.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {getIconComponent(type.icon)}
                            <span className="ml-2 text-xs text-muted-foreground">{type.icon}</span>
                          </div>
                        </TableCell>
                        <TableCell>{categories.filter((c) => c.typeId === type.id).length} kategori</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                            onClick={() => {
                              setSelectedTypeToDelete(type)
                              setIsDeleteTypeDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Kategori</DialogTitle>
              <DialogDescription>Edit informasi kategori</DialogDescription>
            </DialogHeader>
            {selectedCategoryState && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-type" className="md:text-right">
                    Tipe
                  </Label>
                  <Select
                    value={selectedCategoryState.typeId}
                    onValueChange={(value) => setSelectedCategoryState({ ...selectedCategoryState, typeId: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="md:text-right">
                    Nama Kategori
                  </Label>
                  <Input
                    id="edit-name"
                    value={selectedCategoryState.name}
                    onChange={(e) => setSelectedCategoryState({ ...selectedCategoryState, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-publisher" className="md:text-right">
                    Publisher
                  </Label>
                  <Input
                    id="edit-publisher"
                    value={selectedCategoryState.publisher}
                    onChange={(e) => setSelectedCategoryState({ ...selectedCategoryState, publisher: e.target.value })}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4">
                  <Label htmlFor="edit-description" className="md:text-right pt-2">
                    Deskripsi
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={selectedCategoryState.description}
                    onChange={(e) =>
                      setSelectedCategoryState({ ...selectedCategoryState, description: e.target.value })
                    }
                    className="col-span-3"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4">
                  <Label htmlFor="edit-popup" className="md:text-right pt-2">
                    Popup Info
                  </Label>
                  <Textarea
                    id="edit-popup"
                    placeholder="Informasi penting yang akan ditampilkan dalam popup"
                    className="col-span-3"
                    rows={3}
                    value={selectedCategoryState.popup}
                    onChange={(e) => setSelectedCategoryState({ ...selectedCategoryState, popup: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-input-type" className="md:text-right">
                    Tipe Input
                  </Label>
                  <Select
                    value={selectedCategoryState.inputType || "text"}
                    onValueChange={(value) =>
                      setSelectedCategoryState({
                        ...selectedCategoryState,
                        inputType: value as "text" | "number" | "email" | "tel",
                      })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih tipe input" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="tel">Telephone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-input-label" className="md:text-right">
                    Label Input
                  </Label>
                  <Input
                    id="edit-input-label"
                    placeholder="Label untuk input (contoh: User ID, Email, dll)"
                    className="col-span-3"
                    value={selectedCategoryState.inputLabel}
                    onChange={(e) => setSelectedCategoryState({ ...selectedCategoryState, inputLabel: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-input-placeholder" className="md:text-right">
                    Placeholder Input
                  </Label>
                  <Input
                    id="edit-input-placeholder"
                    placeholder="Placeholder untuk input"
                    className="col-span-3"
                    value={selectedCategoryState.inputPlaceholder}
                    onChange={(e) =>
                      setSelectedCategoryState({ ...selectedCategoryState, inputPlaceholder: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4">
                  <Label htmlFor="edit-input-help" className="md:text-right pt-2">
                    Teks Bantuan Input
                  </Label>
                  <Textarea
                    id="edit-input-help"
                    placeholder="Teks bantuan yang ditampilkan di bawah input"
                    className="col-span-3"
                    rows={2}
                    value={selectedCategoryState.inputHelp}
                    onChange={(e) => setSelectedCategoryState({ ...selectedCategoryState, inputHelp: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-image" className="md:text-right">
                    Gambar
                  </Label>
                  <div className="col-span-3 flex items-center gap-4">
                    <div className="h-16 w-16 rounded-md bg-secondary flex items-center justify-center overflow-hidden">
                      {selectedCategoryImage || selectedCategoryState.image ? (
                        <img
                          src={selectedCategoryImage || selectedCategoryState.image}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <Input id="edit-image" type="file" accept="image/*" onChange={handleImageUpload} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                  <div className="md:text-right">
                    <Label>Status</Label>
                  </div>
                  <div className="col-span-3 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="edit-active"
                        checked={selectedCategoryState.active}
                        onCheckedChange={(checked) =>
                          setSelectedCategoryState({ ...selectedCategoryState, active: checked })
                        }
                      />
                      <Label htmlFor="edit-active">Aktif</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="edit-popular"
                        checked={selectedCategoryState.popular}
                        onCheckedChange={(checked) =>
                          setSelectedCategoryState({ ...selectedCategoryState, popular: checked })
                        }
                      />
                      <Label htmlFor="edit-popular">Populer</Label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleUpdateCategory}>Simpan Perubahan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Hapus Kategori</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedCategoryState && (
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-md bg-secondary flex items-center justify-center overflow-hidden">
                    {selectedCategoryState.image ? (
                      <img
                        src={selectedCategoryState.image || "/placeholder.svg"}
                        alt={selectedCategoryState.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{selectedCategoryState.name}</div>
                    <div className="text-xs text-muted-foreground">{selectedCategoryState.publisher}</div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleDeleteCategory}>
                Hapus Kategori
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteTypeDialogOpen} onOpenChange={setIsDeleteTypeDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Hapus Tipe</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus tipe ini? Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedTypeToDelete && (
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-md bg-secondary flex items-center justify-center overflow-hidden">
                    {getIconComponent(selectedTypeToDelete.icon)}
                  </div>
                  <div>
                    <div className="font-medium">{selectedTypeToDelete.name}</div>
                    <div className="text-xs text-muted-foreground">{selectedTypeToDelete.id}</div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteTypeDialogOpen(false)}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleDeleteType}>
                Hapus Tipe
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditPackagesDialogOpen} onOpenChange={setIsEditPackagesDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Paket</DialogTitle>
              <DialogDescription>
                {selectedCategoryForPackages ? `Edit paket untuk ${selectedCategoryForPackages.name}` : "Edit paket"}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="flex items-center gap-3 p-3 rounded-md border bg-muted/30 mb-4">
                {selectedCategoryForPackages?.image ? (
                  <img
                    src={selectedCategoryForPackages.image || "/placeholder.svg"}
                    alt={selectedCategoryForPackages.name}
                    className="w-12 h-12 rounded-md object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{selectedCategoryForPackages?.name}</h3>
                  <p className="text-xs text-muted-foreground">{selectedCategoryForPackages?.publisher}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Daftar Paket</h3>
                  <Button variant="outline" size="sm" onClick={() => loadProductsFromApi()} disabled={isLoadingApi}>
                    {isLoadingApi ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Load dari API
                      </>
                    )}
                  </Button>
                </div>

                {packageList.length > 0 ? (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama</TableHead>
                          <TableHead>Harga</TableHead>
                          <TableHead>Kode API</TableHead>
                          <TableHead className="w-[100px]">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {packageList.map((pkg) => (
                          <TableRow key={pkg.id}>
                            <TableCell>{pkg.name}</TableCell>
                            <TableCell>Rp {pkg.price}</TableCell>
                            <TableCell>{pkg.apiCode || "-"}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                                onClick={() => handleDeletePackage(pkg.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-md">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-semibold">Belum ada paket</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Tambahkan paket baru atau pilih dari API.</p>
                  </div>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Tambah Paket Baru</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="package-name">Nama Paket</Label>
                          <Input
                            id="package-name"
                            value={newPackage.name}
                            onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                            placeholder="Contoh: 100 Diamonds"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="package-price">Harga</Label>
                          <Input
                            id="package-price"
                            value={newPackage.price}
                            onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
                            placeholder="Contoh: 20000"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="package-api-code">Kode API (Opsional)</Label>
                        <Input
                          id="package-api-code"
                          value={newPackage.apiCode}
                          onChange={(e) => setNewPackage({ ...newPackage, apiCode: e.target.value })}
                          placeholder="Kode API untuk integrasi"
                        />
                      </div>
                      <Button onClick={handleAddPackage} disabled={!newPackage.name || !newPackage.price}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Paket
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {apiProducts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Pilih dari API</CardTitle>
                      <CardDescription>Pilih produk dari API untuk ditambahkan sebagai paket</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Popover open={openProductSelect} onOpenChange={setOpenProductSelect}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openProductSelect}
                              className="w-full justify-between"
                              type="button"
                            >
                              {selectedProductItem ? selectedProductItem.keterangan : "Pilih Produk"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Cari produk..." />
                              <CommandList className="max-h-[300px] overflow-y-auto">
                                <CommandEmpty>Produk tidak ditemukan.</CommandEmpty>
                                {Object.entries(groupedApiProducts).map(([category, products]) => (
                                  <CommandGroup key={category} heading={category}>
                                    {products.map((product) => (
                                      <CommandItem
                                        key={product.kode}
                                        onSelect={() => handleSelectApiProduct(product)}
                                        className="flex flex-col items-start py-2"
                                      >
                                        <div className="font-medium">{product.keterangan}</div>
                                        <div className="text-xs text-muted-foreground flex justify-between w-full">
                                          <span>Kode: {product.kode}</span>
                                          <span className="font-semibold text-primary">Rp {product.harga}</span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                ))}
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        {selectedProductPlans.length > 0 && (
                          <div className="space-y-2">
                            <Label>Paket yang Dipilih</Label>
                            <div className="border rounded-md p-3">
                              {selectedProductPlans.map((plan) => (
                                <div
                                  key={plan.id}
                                  className="flex justify-between items-center py-2 border-b last:border-0"
                                >
                                  <div>
                                    <div className="font-medium">{plan.name}</div>
                                    <div className="text-xs text-muted-foreground">Kode: {plan.apiCode}</div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="font-semibold text-primary">Rp {plan.price}</div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-primary hover:text-primary/80"
                                      onClick={() => {
                                        setPackageList([...packageList, ...selectedProductPlans])
                                        setSelectedProductPlans([])
                                        setSelectedProductItem(null)
                                      }}
                                    >
                                      <Plus className="h-4 w-4" />
                                      <span className="sr-only">Add</span>
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditPackagesDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleSavePackages}>Simpan Paket</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminAuthWrapper>
  )
}

