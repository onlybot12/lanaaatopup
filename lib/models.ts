import type { ObjectId } from "mongodb"

export interface Product {
  _id?: string | ObjectId
  id?: string
  name: string
  description?: string
  publisher?: string
  category?: string
  image?: string
  popular?: boolean
  active?: boolean
  packages: ProductPackage[]
  createdAt?: Date
  updatedAt?: Date
}

export interface ProductPackage {
  id: string
  name: string
  price: string
  qrisPrice?: string
  description?: string
  apiCode?: string
}

// Tambahkan field popup, inputType, inputLabel, inputPlaceholder, dan inputHelp ke model Category
export interface Category {
  _id?: string | ObjectId
  id: string
  name: string
  typeId: string
  count: number
  image?: string
  description?: string
  publisher?: string
  popular?: boolean
  active?: boolean
  popup?: string
  inputType?: "text" | "number" | "email" | "tel"
  inputLabel?: string
  inputPlaceholder?: string
  inputHelp?: string
}

export interface Type {
  _id?: string | ObjectId
  id: string
  name: string
  icon: string
  count: number
}

export interface Transaction {
  _id?: string | ObjectId
  userId: string
  productId: string
  packageId: string
  amount: number
  status: "pending" | "completed" | "failed"
  paymentMethod: string
  referenceId: string
  whatsapp?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface WebsiteSettings {
  _id?: string | ObjectId
  siteName: string
  siteUrl: string
  description: string
  keywords: string
  maintenanceMode: boolean
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
}

