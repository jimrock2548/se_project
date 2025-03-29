import { NextResponse } from "next/server"
import axios from "axios"

export async function GET(request, { params }) {
  try {
    const { roomId } = params
    const token = request.headers.get("authorization")

    if (!token) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 401 })
    }

    const apiUrl = process.env.API_BASE_URL || "http://localhost:5000"
    const response = await axios.get(`${apiUrl}/api/rooms/${roomId}/meter-readings`, {
      headers: {
        Authorization: token,
      },
    })

    return NextResponse.json(response.data)
  } catch (error) {
    console.error("Error fetching meter readings:", error)
    return NextResponse.json(
      { error: error.response?.data?.error || "เกิดข้อผิดพลาดในการดึงข้อมูลมิเตอร์" },
      { status: error.response?.status || 500 },
    )
  }
}

