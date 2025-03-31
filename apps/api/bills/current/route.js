// API route for current bill
export async function GET(req) {
  try {
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
      const response = await fetch(`${process.env.API_BASE_URL || "http://localhost:5000"}/api/bills/current`, {
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
      console.error("Error fetching current bill from backend:", error)

      // ถ้าไม่สามารถเชื่อมต่อกับ API หลักได้ ให้ส่งข้อมูลจำลองกลับไป
      // ดึงข้อมูลผู้ใช้จาก token
      let userData = { fullName: "ผู้เช่า", residentId: null }
      try {
        const token = authHeader.split(" ")[1]
        const tokenData = JSON.parse(atob(token.split(".")[1]))
        userData = {
          fullName: tokenData.fullName || "ผู้เช่า",
          residentId: tokenData.residentId,
        }
      } catch (e) {
        console.error("Error parsing token:", e)
      }

      return new Response(
        JSON.stringify({
          roomNumber: "123",
          residentName: userData.fullName,
          totalAmount: 4650,
          dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
          status: "PENDING",
          billItems: [
            { description: "ค่าน้ำประปา", amount: 450 },
            { description: "ค่าไฟฟ้า", amount: 1000 },
            { description: "ค่าอินเทอร์เน็ต", amount: 200 },
            { description: "ค่าเช่าห้อง", amount: 3000 },
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

