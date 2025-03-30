import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"
import FormData from "form-data"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()

    const form = new FormData()
    form.append("file", Buffer.from(buffer), {
      filename: file.name || "upload.png",
      contentType: file.type || "image/png",
    })

    const response = await axios.post("https://www.itzky.xyz/api/upload/", form, {
      headers: {
        ...form.getHeaders(),
      },
    })

    if (response.data && response.data.url) {
      return NextResponse.json({ url: response.data.url })
    } else {
      return NextResponse.json({ error: "Invalid response from upload API" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Gagal mengunggah file" }, { status: 500 })
  }
}

