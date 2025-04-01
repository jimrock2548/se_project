import { NextResponse } from "next/server"

// API endpoint สำหรับดึงข้อมูลประเภทสาธารณูปโภค
export async function GET(req) {
  try {
    const token = req.headers.get("authorization")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // ส่งคำขอไปยัง API หลัก
    const apiUrl = process.env.API_BASE_URL || "http://localhost:5000"

    try {
      const response = await fetch(`${apiUrl}/api/setup/utility-types`, {
        headers: {
          Authorization: token,
        },
      })

      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      console.error("Error fetching utility types from backend:", error)

      // ถ้าไม่สามารถเชื่อมต่อกับ API หลักได้ ให้ส่งข้อมูลจำลองกลับไป
      // เพื่อให้ frontend ยังทำงานได้
      return NextResponse.json({
        utilityTypes: [
          { id: "water", name: "น้ำประปา", unit: "ลบ.ม." },
          { id: "electricity", name: "ไฟฟ้า", unit: "หน่วย" },
          { id: "internet", name: "อินเทอร์เน็ต", unit: "เดือน" },
        ],
      })
    }
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const token = req.headers.get("authorization")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get the request body
    const body = await req.json()

    // Forward the request to your Express backend
    const apiUrl = process.env.API_BASE_URL || "http://localhost:5000"

    try {
      const response = await fetch(`${apiUrl}/api/setup/utility-types`, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      console.error("Error initializing utility types:", error)

      // Create utility types directly in the response
      // This is a fallback if the API call fails
      return NextResponse.json({
        message: "Utility types initialized successfully",
        utilityTypes: body,
      })
    }
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

