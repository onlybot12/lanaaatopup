import clientPromise from "./mongodb"
import { ObjectId } from "mongodb"
import type { Product, Category, Type, WebsiteSettings, Transaction } from "./models"

export async function getProducts() {
  try {
    const client = await clientPromise
    const db = client.db()
    return await db.collection("products").find({}).toArray()
  } catch (error) {
    console.error("Error in getProducts:", error)
    return []
  }
}

export async function getProductById(id: string) {
  try {
    const client = await clientPromise
    const db = client.db()

    if (ObjectId.isValid(id)) {
      return await db.collection("products").findOne({ _id: new ObjectId(id) })
    } else {
      return await db.collection("products").findOne({ id: id })
    }
  } catch (error) {
    console.error("Error in getProductById:", error)
    return null
  }
}

export async function getCategoryById(id: string) {
  try {
    const client = await clientPromise
    const db = client.db()

    if (ObjectId.isValid(id)) {
      return await db.collection("categories").findOne({ _id: new ObjectId(id) })
    } else {
      return await db.collection("categories").findOne({ id: id })
    }
  } catch (error) {
    console.error("Error in getCategoryById:", error)
    return null
  }
}

export async function getProductsByCategory(categoryId: string) {
  try {
    const client = await clientPromise
    const db = client.db()
    return await db.collection("products").find({ category: categoryId }).toArray()
  } catch (error) {
    console.error("Error in getProductsByCategory:", error)
    return []
  }
}

export async function createProduct(product: Product) {
  try {
    const client = await clientPromise
    const db = client.db()
    product.createdAt = new Date()
    product.updatedAt = new Date()
    const result = await db.collection("products").insertOne(product)
    return result
  } catch (error) {
    console.error("Error in createProduct:", error)
    throw error
  }
}

export async function updateProduct(id: string, product: Partial<Product>) {
  try {
    const client = await clientPromise
    const db = client.db()
    product.updatedAt = new Date()

    if (product._id) {
      delete product._id
    }

    const result = await db.collection("products").updateOne({ _id: new ObjectId(id) }, { $set: product })
    return result
  } catch (error) {
    console.error("Error in updateProduct:", error)
    throw error
  }
}

export async function deleteProduct(id: string) {
  try {
    const client = await clientPromise
    const db = client.db()
    const result = await db.collection("products").deleteOne({ _id: new ObjectId(id) })
    return result
  } catch (error) {
    console.error("Error in deleteProduct:", error)
    throw error
  }
}

export async function getCategories() {
  try {
    const client = await clientPromise
    const db = client.db()
    return await db.collection("categories").find({}).toArray()
  } catch (error) {
    console.error("Error in getCategories:", error)
    return []
  }
}

export async function createCategory(category: Category) {
  try {
    const client = await clientPromise
    const db = client.db()
    const result = await db.collection("categories").insertOne(category)
    return result
  } catch (error) {
    console.error("Error in createCategory:", error)
    throw error
  }
}

export async function updateCategory(id: string, category: Partial<Category>) {
  try {
    const client = await clientPromise
    const db = client.db()

    if (category._id) {
      delete category._id
    }

    const result = await db.collection("categories").updateOne({ _id: new ObjectId(id) }, { $set: category })
    return result
  } catch (error) {
    console.error("Error in updateCategory:", error)
    throw error
  }
}

export async function deleteCategory(id: string) {
  try {
    const client = await clientPromise
    const db = client.db()
    const result = await db.collection("categories").deleteOne({ _id: new ObjectId(id) })
    return result
  } catch (error) {
    console.error("Error in deleteCategory:", error)
    throw error
  }
}

export async function getTypes() {
  try {
    const client = await clientPromise
    const db = client.db()
    return await db.collection("types").find({}).toArray()
  } catch (error) {
    console.error("Error in getTypes:", error)
    return []
  }
}

export async function createType(type: Type) {
  try {
    const client = await clientPromise
    const db = client.db()
    const result = await db.collection("types").insertOne(type)
    return result
  } catch (error) {
    console.error("Error in createType:", error)
    throw error
  }
}

export async function getTypeById(id: string) {
  try {
    const client = await clientPromise
    const db = client.db()

    if (ObjectId.isValid(id)) {
      return await db.collection("types").findOne({ _id: new ObjectId(id) })
    } else {
      return await db.collection("types").findOne({ id: id })
    }
  } catch (error) {
    console.error("Error in getTypeById:", error)
    return null
  }
}

export async function updateType(id: string, type: Partial<Type>) {
  try {
    const client = await clientPromise
    const db = client.db()

    if (type._id) {
      delete type._id
    }

    const result = await db
      .collection("types")
      .updateOne(ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: id }, { $set: type })
    return result
  } catch (error) {
    console.error("Error in updateType:", error)
    throw error
  }
}

export async function deleteType(id: string) {
  try {
    const client = await clientPromise
    const db = client.db()
    const result = await db.collection("types").deleteOne(ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: id })
    return result
  } catch (error) {
    console.error("Error in deleteType:", error)
    throw error
  }
}

export async function getWebsiteSettings() {
  try {
    const client = await clientPromise
    const db = client.db()
    const settings = await db.collection("settings").findOne({})
    return settings || getDefaultSettings()
  } catch (error) {
    console.error("Error in getWebsiteSettings:", error)
    return getDefaultSettings()
  }
}

export async function updateWebsiteSettings(settings: Partial<WebsiteSettings>) {
  try {
    const client = await clientPromise
    const db = client.db()

    if (settings._id) {
      delete settings._id
    }

    const result = await db.collection("settings").updateOne({}, { $set: settings }, { upsert: true })
    return result
  } catch (error) {
    console.error("Error in updateWebsiteSettings:", error)
    throw error
  }
}

export async function createTransaction(transaction: Transaction) {
  try {
    const client = await clientPromise
    const db = client.db()
    transaction.createdAt = new Date()
    transaction.updatedAt = new Date()
    const result = await db.collection("transactions").insertOne(transaction)
    return result
  } catch (error) {
    console.error("Error in createTransaction:", error)
    throw error
  }
}

export async function updateTransaction(id: string, transaction: Partial<Transaction>) {
  try {
    const client = await clientPromise
    const db = client.db()
    transaction.updatedAt = new Date()

    if (transaction._id) {
      delete transaction._id
    }

    const result = await db.collection("transactions").updateOne({ _id: new ObjectId(id) }, { $set: transaction })
    return result
  } catch (error) {
    console.error("Error in updateTransaction:", error)
    throw error
  }
}

export async function getTransactionByReferenceId(referenceId: string) {
  try {
    const client = await clientPromise
    const db = client.db()
    return await db.collection("transactions").findOne({ referenceId })
  } catch (error) {
    console.error("Error in getTransactionByReferenceId:", error)
    return null
  }
}

function getDefaultSettings(): WebsiteSettings {
  return {
    siteName: "LANA STORE",
    siteUrl: "https://lanaaatopup.vercel.app",
    description: "Website topup murah cepat dan terpecaya di Indonesia 100% Legal.",
    keywords: "topup game, diamond murah, Lanastore, mobile legends",
    maintenanceMode: false,
    contact: {
      email: "info@zkygame.com",
      phone: "+62 896 7566 2384",
      address: "Jl. Pondok Aren, Tangerang Selatan, Indonesia",
      whatsapp: "+62 896 7566 2384",
      hours: {
        weekday: "08:00 - 21:00 WIB",
        weekend: "09:00 - 18:00 WIB",
        is24Hours: false,
      },
    },
    social: {
      facebook: "https://facebook.com/",
      instagram: "https://instagram.com/",
      twitter: "https://twitter.com/",
      youtube: "https://youtube.com/",
    },
    appearance: {
      primaryColor: "#dc2626",
      secondaryColor: "#1e293b",
      darkModeDefault: true,
      allowThemeSwitch: true,
    },
    footer: {
      text: "© 2025 Lana Store. All rights reserved.",
      showPaymentIcons: true,
      showSocialIcons: true,
    },
    okeconnect: {
      apiUrl: "https://okeconnect.com/harga/json?id=905ccd028329b0a",
      apiKey: "399257317307325111356619OKCTA013407C630E4BF06610210F74C83B0C",
      merchantId: "OK1356619",
      pin: "4152",
      password: "Zaki4321",
      qrisCode:
        "00020101021226670016COM.NOBUBANK.WWW01189360050300000879140214137226078776130303UMI51440014ID.CO.QRIS.WWW0215ID20232946906310303UMI5204481253033605802ID5918ZAKICELL%20OK13566196005SOLOK61052731162070703A016304B61D",
      callbackUrl: "https://zkygame.com/api/callback/okeconnect",
      markup: 10,
      autoUpdate: true,
      updateInterval: 6,
    },
  }
}

