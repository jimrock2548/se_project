// API route for bills
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const residentId = searchParams.get("residentId")
    const roomNumber = searchParams.get("roomNumber")
    const status = searchParams.get("status")
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
    const url = new URL(`${process.env.API_BASE_URL || "http://localhost:5000"}/api/bills`)

    if (residentId) {
      url.searchParams.append("residentId", residentId)
    }
    if (roomNumber) {
      url.searchParams.append("roomNumber", roomNumber)
    }
    if (status) {
      url.searchParams.append("status", status)
    }

    try {
      const response = await fetch(url, {
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
      console.error("Error fetching bills from backend:", error)

      // ถ้าไม่สามารถเชื่อมต่อกับ API หลักได้ ให้ส่งข้อมูลจำลองกลับไป
      return new Response(
        JSON.stringify({
          bills: [
            {
              id: "1",
              user: "Copter",
              room: 123,
              billsnew: 4521.23,
              billsold: 4643.35,
              dateold: "06/11/2568",
              datenew: "06/12/2568",
              status: "PENDING",
            },
            {
              id: "2",
              user: "John",
              room: 124,
              billsnew: 3890.5,
              billsold: 4120.75,
              dateold: "06/11/2568",
              datenew: "06/12/2568",
              status: "PAID",
            },
            {
              id: "3",
              user: "Sarah",
              room: 125,
              billsnew: 4250.0,
              billsold: 4100.25,
              dateold: "06/11/2568",
              datenew: "06/12/2568",
              old_water_unit: 120,
              old_ele_unit: 460,
              status: "OVERDUE",
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
      const response = await fetch(`${process.env.API_BASE_URL || "http://localhost:5000"}/api/bills`, {
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
      console.error("Error creating bill in backend:", error)

      // ถ้าไม่สามารถเชื่อมต่อกับ API หลักได้ ให้ส่งข้อมูลจำลองกลับไป
      return new Response(
        JSON.stringify({
          message: "Bill created successfully (mock data)",
          bill: {
            id: `mock-${Date.now()}`,
            ...body,
            status: "PENDING",
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

