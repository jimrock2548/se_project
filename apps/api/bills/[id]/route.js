// API route for specific bill
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
      const response = await fetch(`${process.env.API_BASE_URL || "http://localhost:5000"}/api/bills/${id}`, {
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
      console.error("Error fetching bill from backend:", error)

      // ถ้าไม่สามารถเชื่อมต่อกับ API หลักได้ ให้ส่งข้อมูลจำลองกลับไป
      return new Response(
        JSON.stringify({
          bill: {
            id,
            user: "Mock User",
            room: "101",
            billsnew: 3500,
            billsold: 0,
            dateold: "",
            datenew: new Date().toLocaleDateString("th-TH"),
            status: "PENDING",
          },
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

export async function PATCH(req, { params }) {
  try {
    const { id } = params
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
      const response = await fetch(`${process.env.API_BASE_URL || "http://localhost:5000"}/api/bills/${id}`, {
        method: "PATCH",
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
      console.error("Error updating bill in backend:", error)

      // ถ้าไม่สามารถเชื่อมต่อกับ API หลักได้ ให้ส่งข้อมูลจำลองกลับไป
      return new Response(
        JSON.stringify({
          message: "Bill updated successfully (mock data)",
          bill: {
            id,
            ...body,
            updatedAt: new Date().toISOString(),
          },
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

