import { NextResponse } from "next/server"
import axios from "axios"

export async function POST(request) {
  try {
    const token = request.headers.get("authorization")

    if (!token) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 401 })
    }

    const body = await request.json()
    const apiUrl = process.env.API_BASE_URL || "http://localhost:5000"

    const response = await axios.post(`${apiUrl}/api/meter-readings`, body, {
      headers: {
        Authorization: token,
      },
    })

    return NextResponse.json(response.data)
  } catch (error) {
    console.error("Error creating meter reading:", error)
    return NextResponse.json(
      { error: error.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูลมิเตอร์" },
      { status: error.response?.status || 500 },
    )
  }
}

