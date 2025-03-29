import { NextResponse } from "next/server"

// ฟังก์ชันจำลองข้อมูลบิล
function getMockBills() {
  return [
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
  ]
}

export async function GET(request) {
  try {
    // ในตอนนี้ เราจะใช้ข้อมูลจำลองแทนการเรียก API จริง
    const bills = getMockBills()

    return NextResponse.json({
      success: true,
      bills: bills,
    })
  } catch (error) {
    console.error("Error fetching bills:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลบิล" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    console.log("Received bill data:", body)

    // จำลองการสร้างบิลใหม่
    const newBill = {
      id: `temp-${Date.now()}`,
      user: body.residentName || "ผู้เช่าใหม่",
      room: body.roomNumber || 999,
      billsnew: body.totalAmount || 0,
      billsold: 0,
      dateold: "",
      datenew: new Date().toLocaleDateString("th-TH"),
      status: "PENDING",
    }

    return NextResponse.json({
      success: true,
      bill: newBill,
    })
  } catch (error) {
    console.error("Error creating bill:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างบิล" }, { status: 500 })
  }
}

