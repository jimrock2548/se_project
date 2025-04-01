// API route for room meters
export async function GET(req, { params }) {
  try {
    const { id } = params
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
      const response = await fetch(`${process.env.API_BASE_URL || "http://localhost:5000"}/api/rooms/${id}/meters`, {
        method: "GET",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
        },
      })
    } catch (error) {
      console.error("Error fetching room meters from backend:", error)

      // ถ้าไม่สามารถเชื่อมต่อกับ API หลักได้ ให้ส่งข้อมูลจำลองกลับไป
      return new Response(
        JSON.stringify({
          meters: [
            {
              id: "water-meter-1",
              roomId: id,
              meterNumber: "W" + id + "001",
              utilityType: {
                id: "water",
                name: "น้ำประปา",
                unit: "ลบ.ม.",
              },
              isActive: true,
            },
            {
              id: "electricity-meter-1",
              roomId: id,
              meterNumber: "E" + id + "001",
              utilityType: {
                id: "electricity",
                name: "ไฟฟ้า",
                unit: "หน่วย",
              },
              isActive: true,
            },
          ],
        }),
        {
          status: 200,
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

