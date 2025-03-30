import axios from "axios"

export const uploadBufferToCDN = async (buffer: ArrayBuffer, filename = "image.png", contentType = "image/png") => {
  try {
    // Buat FormData
    const formData = new FormData()
    const blob = new Blob([buffer], { type: contentType })
    formData.append("file", blob, filename)

    // Kirim request ke API upload
    const response = await axios.post("https://www.itzky.xyz/api/upload/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    // Periksa response
    if (response.data && response.data.url) {
      return response.data.url
    } else {
      throw new Error("Invalid response from upload API")
    }
  } catch (error) {
    console.error("Error uploading to CDN:", error)
    throw new Error("Failed to upload file")
  }
}

export const uploadFileToCDN = async (file: File) => {
  try {
    // Buat FormData
    const formData = new FormData()
    formData.append("file", file)

    // Kirim request ke API upload
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    // Periksa response
    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`)
    }

    const data = await response.json()

    if (data && data.url) {
      return data.url
    } else {
      throw new Error("Invalid response from upload API")
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    throw new Error("Failed to upload file")
  }
}

