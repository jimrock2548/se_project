import { NextResponse } from "next/server"
import axios from "axios"

export async function GET(request, { params }) {
  try {
    const { meterId } = params
    const token = request.headers.get("authorization")
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit")

    if (!token) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 401 })
    }

    const apiUrl = process.env.API_BASE_URL || "http://localhost:5000"
    const url = `${apiUrl}/api/meters/${meterId}/readings${limit ? `?limit=${limit}` : ""}`

    const response = await axios.get(url, {
      headers: {
        Authorization: token,
      },
    })

    return NextResponse.json(response.data)
  } catch (error) {
    console.error("Error fetching meter reading history:", error)
    return NextResponse.json(
      { error: error.response?.data?.error || "เกิดข้อผิดพลาดในการดึงประวัติข้อมูลมิเตอร์" },
      { status: error.response?.status || 500 },
    )
  }
}

