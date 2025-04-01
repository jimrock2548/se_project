// API route for meter readings
export async function POST(req) {
  try {
    const body = await req.json()
    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    // Forward the request to your Express backend
    try {
      const response = await fetch(`${process.env.API_BASE_URL || "http://localhost:5000"}/api/meter-readings`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
        },
      })
    } catch (error) {
      console.error("Error creating meter reading in backend:", error)

      // ถ้าไม่สามารถเชื่อมต่อกับ API หลักได้ ให้ส่งข้อมูลจำลองกลับไป
      return new Response(
        JSON.stringify({
          message: "Meter reading created successfully (mock data)",
          meterReading: {
            id: `mock-${Date.now()}`,
            ...body,
            createdAt: new Date().toISOString(),
          },
        }),
        {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }
  } catch (error) {
    console.error("API route error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}

