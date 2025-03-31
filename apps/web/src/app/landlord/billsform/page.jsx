"use client"

import { useState, useEffect } from "react"
import axios from "axios"
// เปลี่ยน import ไอคอน โดยลบ Printer ออก
import { Save, CheckCircle, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

// ในฟังก์ชัน BillsFormPage ให้ลบตัวแปรที่เกี่ยวข้องกับการพิมพ์
export default function BillsFormPage() {
  const [datapayment, setDataPayment] = useState([])
  const [rooms, setRooms] = useState([])
  const [residents, setResidents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [utilityTypes, setUtilityTypes] = useState([])
  const [meters, setMeters] = useState([])
  const router = useRouter()

  // ข้อมูลสำหรับการคำนวณ
  const [roomNumber, setRoomNumber] = useState("")
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [selectedResident, setSelectedResident] = useState(null)
  const [defaultwater, setDefaultWater] = useState(18)
  const [defaultelectricity, setDefaultElectricity] = useState(8)
  const [defaultnet, setDefaultNet] = useState(200)
  const [defaultrent, setDefaultRent] = useState(3000)
  const [oldWaterUnit, setOldWaterUnit] = useState(0)
  const [oldElectricityUnit, setOldElectricityUnit] = useState(0)
  const [newWaterUnit, setNewWaterUnit] = useState(0)
  const [newElectricityUnit, setNewElectricityUnit] = useState(0)
  const [totalWater, setTotalWater] = useState(0)
  const [totalElectricity, setTotalElectricity] = useState(0)
  const [totalAll, setTotalAll] = useState(0)
  const [billDate, setBillDate] = useState(new Date().toISOString().split("T")[0])
  const [dueDate, setDueDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split("T")[0],
  )

  // เก็บข้อมูลมิเตอร์
  const [waterMeter, setWaterMeter] = useState(null)
  const [electricityMeter, setElectricityMeter] = useState(null)

  // ลบตัวแปรที่เกี่ยวข้องกับการพิมพ์
  // const printRef = useRef()
  // const [printData, setPrintData] = useState(null)

  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  // ดึงข้อมูลห้องและผู้เช่า
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // ดึง token
        const token =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token") ||
          localStorage.getItem("authToken") ||
          sessionStorage.getItem("authToken")

        console.log("Token found:", token ? "Yes (length: " + token.length + ")" : "No")

        if (!token) {
          setError("กรุณาเข้าสู่ระบบก่อน")
          setIsLoading(false)
          return
        }

        // ดึงข้อมูลห้อง
        try {
          const roomsResponse = await axios.get(`${url}/api/rooms`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          console.log("Rooms data:", roomsResponse.data)
          setRooms(roomsResponse.data.rooms || [])
        } catch (err) {
          console.warn("Could not fetch rooms:", err)

          // ตรวจสอบว่าเป็นข้อผิดพลาดเกี่ยวกับการยืนยันตัวตนหรือไม่
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            console.error("Authentication error, redirecting to login")
            // ลบ token เก่าและ redirect ไปหน้า login
            localStorage.removeItem("token")
            sessionStorage.removeItem("token")
            localStorage.removeItem("authToken")
            sessionStorage.removeItem("authToken")
            router.push("/")
            return
          }

          setRooms([])
        }

        // ดึงข้อมูลผู้ใช้ที่เป็น RESIDENT
        try {
          const usersResponse = await axios.get(`${url}/api/users?role=RESIDENT`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          console.log("Resident users:", usersResponse.data)
          setResidents(usersResponse.data.users || [])
        } catch (err) {
          console.warn("Could not fetch users:", err)
          setResidents([])
        }

        // ดึงข้อมูลประเภทสาธารณูปโภค
        try {
          const utilityTypesResponse = await axios.get(`${url}/api/utility-types`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          console.log("Utility types:", utilityTypesResponse.data)
          setUtilityTypes(utilityTypesResponse.data.utilityTypes || [])
        } catch (err) {
          console.warn("Could not fetch utility types:", err)
          setUtilityTypes([])
        }

        // ดึงข้อมูลใบชำระเดิม
        try {
          console.log("Fetching bills from:", `${url}/api/bills`)
          const billsResponse = await axios.get(`${url}/api/bills`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          console.log("Bills data:", billsResponse.data)

          // แปลงข้อมูลจาก API ให้เข้ากับรูปแบบที่ต้องการ
          const formattedBills = billsResponse.data.bills.map((bill) => ({
            id: bill.id,
            user: bill.resident?.user?.fullName || "ไม่ระบุ",
            room: bill.resident?.room?.roomNumber || "ไม่ระบุ",
            billsnew: bill.totalAmount,
            billsold: 0,
            dateold: "",
            datenew: new Date(bill.createdAt).toLocaleDateString("th-TH"),
            status: bill.status,
            // ข้อมูลเพิ่มเติมถ้ามี
            old_water_unit: 0,
            old_ele_unit: 0,
            new_water_unit: 0,
            new_ele_unit: 0,
          }))

          setDataPayment(formattedBills)
        } catch (err) {
          console.warn("Could not fetch bills:", err)
          setDataPayment([])
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล: " + (err.response?.data?.error || err.message))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [url, router])

  // ค้นหาห้องตามหมายเลข
  const handleRoomSearch = async () => {
    if (!roomNumber) {
      alert("กรุณาระบุหมายเลขห้อง")
      return
    }

    const room = rooms.find((r) => r.roomNumber === roomNumber)
    if (!room) {
      alert("ไม่พบห้องหมายเลข " + roomNumber)
      return
    }

    setSelectedRoom(room)

    // หาผู้เช่าในห้องนี้
    const roomResidents = room.residents?.filter((r) => r.isActive) || []
    if (roomResidents.length > 0) {
      // ใช้ resident ID โดยตรงจากข้อมูลห้อง
      const residentId = roomResidents[0].id
      const resident = residents.find((r) => r.id === roomResidents[0].userId)

      if (resident) {
        // เก็บ resident ID ไว้ใน object
        setSelectedResident({
          ...resident,
          residentId: residentId,
        })
      } else {
        setSelectedResident(null)
      }
    } else {
      setSelectedResident(null)
    }

    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken")

      // ดึงข้อมูลมิเตอร์ทั้งหมดของห้อง
      const metersResponse = await axios.get(`${url}/api/rooms/${room.id}/meters`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Room meters:", metersResponse.data)
      setMeters(metersResponse.data.meters || [])

      // หามิเตอร์น้ำและไฟฟ้า
      const waterMeter = metersResponse.data.meters.find(
        (m) =>
          m.utilityType.name.toLowerCase() === "water" ||
          m.utilityType.name.toLowerCase() === "น้ำ" ||
          m.utilityType.name.toLowerCase() === "น้ำประปา",
      )

      const electricityMeter = metersResponse.data.meters.find(
        (m) => m.utilityType.name.toLowerCase() === "electricity" || m.utilityType.name.toLowerCase() === "ไฟฟ้า",
      )

      setWaterMeter(waterMeter || null)
      setElectricityMeter(electricityMeter || null)

      // ดึงข้อมูลการอ่านมิเตอร์ล่าสุด
      const readingsResponse = await axios.get(`${url}/api/rooms/${room.id}/meter-readings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Meter readings:", readingsResponse.data)

      // หาข้อมูลมิเตอร์น้ำและไฟฟ้า
      const waterReading = readingsResponse.data.readings.find(
        (r) =>
          r.utilityType.name.toLowerCase() === "water" ||
          r.utilityType.name.toLowerCase() === "น้ำ" ||
          r.utilityType.name.toLowerCase() === "น้ำประปา",
      )

      const electricityReading = readingsResponse.data.readings.find(
        (r) => r.utilityType.name.toLowerCase() === "electricity" || r.utilityType.name.toLowerCase() === "ไฟฟ้า",
      )

      // ตั้งค่าหน่วยเก่า
      if (waterReading) {
        setOldWaterUnit(waterReading.reading)
      } else {
        setOldWaterUnit(0)
      }

      if (electricityReading) {
        setOldElectricityUnit(electricityReading.reading)
      } else {
        setOldElectricityUnit(0)
      }
    } catch (err) {
      console.error("Error fetching meter data:", err)
      // ถ้าไม่สามารถดึงข้อมูลมิเตอร์ได้ ให้ตั้งค่าเป็น 0
      setOldWaterUnit(0)
      setOldElectricityUnit(0)
      setWaterMeter(null)
      setElectricityMeter(null)
    }

    // ตั้งค่าเช่าพื้นฐานตามห้อง
    setDefaultRent(room.price || room.baseRent || 3000)
  }

  // คำนวณค่าใช้จ่าย
  const calculateBill = () => {
    if (!selectedRoom) {
      alert("กรุณาเลือกห้องก่อน")
      return
    }

    if (!newWaterUnit || !newElectricityUnit) {
      alert("กรุณากรอกหน่วยน้ำและไฟฟ้า")
      return
    }

    // คำนวณค่าน้ำ
    const waterUsed = Math.max(0, Number(newWaterUnit) - Number(oldWaterUnit))
    const waterCost = waterUsed * defaultwater
    setTotalWater(waterCost)

    // คำนวณค่าไฟ
    const electricityUsed = Math.max(0, Number(newElectricityUnit) - Number(oldElectricityUnit))
    const electricityCost = electricityUsed * defaultelectricity
    setTotalElectricity(electricityCost)

    // คำนวณรวม
    const total = waterCost + electricityCost + defaultnet + defaultrent
    setTotalAll(total)
  }

  // บันทึกใบชำระ
  const saveBill = async () => {
    if (totalAll <= 0) {
      alert("กรุณาคำนวณค่าใช้จ่ายก่อน")
      return
    }

    if (!selectedResident) {
      alert("ไม่พบผู้เช่าในห้องนี้")
      return
    }

    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken")

      if (!token) {
        alert("กรุณาเข้าสู่ระบบก่อน")
        router.push("/")
        return
      }

      // บันทึกข้อมูลมิเตอร์ใหม่
      try {
        // บันทึกมิเตอร์น้ำ
        if (waterMeter) {
          console.log("Saving water meter reading:", {
            meterId: waterMeter.id,
            reading: Number(newWaterUnit),
            readingDate: new Date().toISOString(),
          })

          await axios.post(
            `${url}/api/meter-readings`,
            {
              meterId: waterMeter.id,
              reading: Number(newWaterUnit),
              readingDate: new Date().toISOString(),
              note: `บันทึกโดยระบบออกบิล วันที่ ${new Date().toLocaleDateString("th-TH")}`,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )
        }

        // บันทึกมิเตอร์ไฟฟ้า
        if (electricityMeter) {
          console.log("Saving electricity meter reading:", {
            meterId: electricityMeter.id,
            reading: Number(newElectricityUnit),
            readingDate: new Date().toISOString(),
          })

          await axios.post(
            `${url}/api/meter-readings`,
            {
              meterId: electricityMeter.id,
              reading: Number(newElectricityUnit),
              readingDate: new Date().toISOString(),
              note: `บันทึกโดยระบบออกบิล วันที่ ${new Date().toLocaleDateString("th-TH")}`,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )
        }

        console.log("Meter readings saved successfully")
      } catch (err) {
        console.error("Error saving meter readings:", err)
        alert(`เกิดข้อผิดพลาดในการบันทึกข้อมูลมิเตอร์: ${err.response?.data?.error || err.message}`)
        // ไม่ต้องหยุดการทำงานถ้าบันทึกมิเตอร์ไม่สำเร็จ
      }

      // ใช้ resident ID โดยตรง (ไม่ใช่ user ID)
      const residentId = selectedResident.residentId

      if (!residentId) {
        alert("ไม่พบ Resident ID สำหรับผู้เช่านี้")
        return
      }

      // สร้างข้อมูลใบชำระ
      const billData = {
        residentId: residentId,
        residentName: selectedResident.fullName,
        roomNumber: selectedRoom.roomNumber,
        totalAmount: totalAll,
        billingPeriodStart: new Date(billDate).toISOString(),
        billingPeriodEnd: new Date(billDate).toISOString(),
        dueDate: new Date(dueDate).toISOString(),
        billItems: [
          {
            description: "ค่าน้ำประปา",
            amount: totalWater,
            unitUsed: Number(newWaterUnit) - Number(oldWaterUnit),
            rate: defaultwater,
          },
          {
            description: "ค่าไฟฟ้า",
            amount: totalElectricity,
            unitUsed: Number(newElectricityUnit) - Number(oldElectricityUnit),
            rate: defaultelectricity,
          },
          {
            description: "ค่าอินเทอร์เน็ต",
            amount: defaultnet,
            unitUsed: 1,
            rate: defaultnet,
          },
          {
            description: "ค่าเช่าห้อง",
            amount: defaultrent,
            unitUsed: 1,
            rate: defaultrent,
          },
        ],
      }

      console.log("Saving bill:", billData)

      // ส่งข้อมูลไปยัง API
      try {
        console.log("Sending bill data to API:", billData)
        console.log("API URL:", `${url}/api/bills`)

        const response = await axios.post(`${url}/api/bills`, billData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        console.log("Bill saved:", response.data)
        alert("บันทึกใบชำระสำเร็จ")

        // เพิ่มใบชำระใหม่ในรายการ
        const newBill = {
          id: response.data.bill.id,
          user: selectedResident.fullName,
          room: selectedRoom.roomNumber,
          billsnew: totalAll,
          billsold: 0,
          dateold: "",
          datenew: new Date().toLocaleDateString("th-TH"),
          old_water_unit: oldWaterUnit,
          old_ele_unit: oldElectricityUnit,
          new_water_unit: newWaterUnit,
          new_ele_unit: newElectricityUnit,
          status: "PENDING",
        }

        setDataPayment([newBill, ...datapayment])

        // รีเซ็ตฟอร์ม
        resetForm()
      } catch (err) {
        console.error("Error saving bill:", err)

        if (err.response) {
          console.error("Error response:", err.response.data)
          console.error("Status code:", err.response.status)
        }

        alert(`เกิดข้อผิดพลาดในการบันทึกบิล: ${err.response?.data?.error || err.message}`)
      }
    } catch (err) {
      console.error("Error in save process:", err)
      alert("เกิดข้อผิดพลาดในการบันทึก: " + (err.response?.data?.error || err.message))
    }
  }

  // ลบบิล
  const deleteBill = async (billId) => {
    console.log("Attempting to delete bill with ID:", billId)

    if (!billId) {
      console.error("No bill ID provided")
      alert("ไม่พบรหัสบิล ไม่สามารถลบได้")
      return
    }

    if (!confirm("คุณต้องการลบใบชำระนี้ใช่หรือไม่?")) {
      return
    }

    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken")

      if (!token) {
        alert("กรุณาเข้าสู่ระบบก่อน")
        router.push("/")
        return
      }

      // ถามว่าต้องการลบข้อมูลการอ่านมิเตอร์ที่เกี่ยวข้องด้วยหรือไม่
      const deleteReadings = confirm("ต้องการลบข้อมูลการอ่านมิเตอร์ที่เกี่ยวข้องด้วยหรือไม่?")

      console.log(`Sending delete request to: ${url}/api/bills/${billId}?deleteRelatedReadings=${deleteReadings}`)

      // ส่งคำขอลบบิล
      const response = await axios.delete(`${url}/api/bills/${billId}?deleteRelatedReadings=${deleteReadings}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Delete response:", response.data)

      // อัปเดตรายการบิล
      setDataPayment(datapayment.filter((bill) => bill.id !== billId))

      alert("ลบใบชำระเรียบร้อยแล้ว")
    } catch (err) {
      console.error("Error deleting bill:", err)
      if (err.response) {
        console.error("Error response:", err.response.data)
        console.error("Status code:", err.response.status)
      }
      alert(`เกิดข้อผิดพลาดในการลบบิล: ${err.response?.data?.error || err.message}`)
    }
  }

  // รีเซ็ตฟอร์ม
  const resetForm = () => {
    setRoomNumber("")
    setSelectedRoom(null)
    setSelectedResident(null)
    setNewWaterUnit(0)
    setNewElectricityUnit(0)
    setOldWaterUnit(0)
    setOldElectricityUnit(0)
    setTotalWater(0)
    setTotalElectricity(0)
    setTotalAll(0)
    setBillDate(new Date().toISOString().split("T")[0])
    setDueDate(new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split("T")[0])
    setWaterMeter(null)
    setElectricityMeter(null)
  }

  // ลบฟังก์ชัน handlePrint และ printBill

  // ลบ handlePrint จาก formProps
  const formProps = {
    roomNumber,
    setRoomNumber,
    selectedRoom,
    selectedResident,
    defaultwater,
    setDefaultWater,
    defaultelectricity,
    setDefaultElectricity,
    defaultnet,
    setDefaultNet,
    defaultrent,
    setDefaultRent,
    oldWaterUnit,
    setOldWaterUnit,
    oldElectricityUnit,
    setOldElectricityUnit,
    newWaterUnit,
    setNewWaterUnit,
    newElectricityUnit,
    setNewElectricityUnit,
    totalWater,
    totalElectricity,
    totalAll,
    billDate,
    setBillDate,
    dueDate,
    setDueDate,
    waterMeter,
    electricityMeter,
    handleRoomSearch,
    calculateBill,
    saveBill,
    resetForm,
  }

  // ลบ printBill จาก billListProps
  const billListProps = {
    datapayment,
    setDataPayment,
    deleteBill,
  }

  return (
    <div className="pt-16 px-6 min-h-screen">
      <div className="flex flex-wrap md:flex-nowrap space-y-4 md:space-y-0 md:space-x-4">
        {/* Bill form card */}
        <div className="md:col-span-2 p-6 rounded-lg shadow-2xl text-base-content w-full">
          <h1 className="text-4xl font-bold text-base-content mb-6">กรอกแบบฟอร์มใบชำระเงิน</h1>
          <BillFormComponent {...formProps} />
        </div>

        {/* Bill list card */}
        <div className="card-body shadow-2xl w-4xl rounded-lg">
          <div className="flex items-center rounded-lg">
            <div className="text-4xl font-bold text-base-content mb-6">รายการใบชำระ</div>
          </div>
          <BillListComponent {...billListProps} />
        </div>
      </div>

      {/* ลบส่วนที่ซ่อนไว้สำหรับการพิมพ์ */}
    </div>
  )
}

// ลบ handlePrint จาก BillFormComponent props
function BillFormComponent({
  roomNumber,
  setRoomNumber,
  selectedRoom,
  selectedResident,
  defaultwater,
  setDefaultWater,
  defaultelectricity,
  setDefaultElectricity,
  defaultnet,
  setDefaultNet,
  defaultrent,
  setDefaultRent,
  oldWaterUnit,
  setOldWaterUnit,
  oldElectricityUnit,
  setOldElectricityUnit,
  newWaterUnit,
  setNewWaterUnit,
  newElectricityUnit,
  setNewElectricityUnit,
  totalWater,
  totalElectricity,
  totalAll,
  billDate,
  setBillDate,
  dueDate,
  setDueDate,
  waterMeter,
  electricityMeter,
  handleRoomSearch,
  calculateBill,
  saveBill,
  resetForm,
}) {
  return (
    <>
      {/* ส่วนค้นหาห้อง */}
      <div className="mb-4 flex items-end">
        <fieldset className="fieldset pr-4 flex-grow">
          <legend className="fieldset-legend">หมายเลขห้อง</legend>
          <div className="flex">
            <input
              type="text"
              className="input flex-grow"
              placeholder="ใส่เลขที่ห้องตรงนี้..."
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
            />
            <button className="btn btn-primary ml-2" onClick={handleRoomSearch}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              ค้นหา
            </button>
          </div>
        </fieldset>
      </div>

      {selectedRoom && (
        <>
          {/* ข้อมูลห้องและผู้เช่า */}
          <div className="mb-4 p-4 bg-base-200 rounded-lg">
            <h3 className="font-bold text-lg">ข้อมูลห้อง: {selectedRoom.roomNumber}</h3>
            <p>ผู้เช่า: {selectedResident ? selectedResident.fullName : "ไม่มีผู้เช่า"}</p>
            <p>ค่าเช่าพื้นฐาน: {selectedRoom.baseRent || defaultrent} บาท</p>
            {waterMeter && <p>มิเตอร์น้ำ: {waterMeter.meterNumber}</p>}
            {electricityMeter && <p>มิเตอร์ไฟฟ้า: {electricityMeter.meterNumber}</p>}
            {selectedResident && selectedResident.residentId && (
              <p className="text-xs text-gray-500">Resident ID: {selectedResident.residentId}</p>
            )}
          </div>

          {/* วันที่ออกบิลและวันครบกำหนด */}
          <div className="flex mb-4">
            <fieldset className="fieldset pr-4 flex-1">
              <legend className="fieldset-legend">วันที่ออกบิล</legend>
              <input
                type="date"
                className="input w-full"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
              />
            </fieldset>

            <fieldset className="fieldset pr-4 flex-1">
              <legend className="fieldset-legend">วันครบกำหนดชำระ</legend>
              <input
                type="date"
                className="input w-full"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </fieldset>
          </div>

          {/* ค่าไฟฟ้า */}
          <div className="flex mb-4">
            <fieldset className="fieldset pr-4 flex-1">
              <legend className="fieldset-legend">ค่าไฟฟ้า : ราคาต่อหน่วย</legend>
              <input
                type="number"
                className="input w-full"
                value={defaultelectricity}
                onChange={(e) => setDefaultElectricity(Number(e.target.value))}
              />
            </fieldset>

            <fieldset className="fieldset pr-4 flex-1">
              <legend className="fieldset-legend">ค่าไฟฟ้า : หน่วยเก่า</legend>
              <input
                type="number"
                className="input w-full"
                value={oldElectricityUnit}
                onChange={(e) => setOldElectricityUnit(Number(e.target.value))}
              />
            </fieldset>

            <fieldset className="fieldset pr-4 flex-1">
              <legend className="fieldset-legend">ค่าไฟฟ้า : หน่วยใหม่</legend>
              <input
                type="number"
                className="input w-full"
                value={newElectricityUnit}
                onChange={(e) => setNewElectricityUnit(Number(e.target.value))}
              />
            </fieldset>

            <fieldset className="fieldset pr-4 flex-1">
              <legend className="fieldset-legend">รวมค่าไฟฟ้า</legend>
              <input type="text" className="input w-full" value={totalElectricity.toFixed(2)} readOnly />
            </fieldset>
          </div>

          {/* ค่าน้ำ */}
          <div className="flex mb-4">
            <fieldset className="fieldset pr-4 flex-1">
              <legend className="fieldset-legend">ค่าน้ำ : ราคาต่อหน่วย</legend>
              <input
                type="number"
                className="input w-full"
                value={defaultwater}
                onChange={(e) => setDefaultWater(Number(e.target.value))}
              />
            </fieldset>

            <fieldset className="fieldset pr-4 flex-1">
              <legend className="fieldset-legend">ค่าน้ำ : หน่วยเก่า</legend>
              <input
                type="number"
                className="input w-full"
                value={oldWaterUnit}
                onChange={(e) => setOldWaterUnit(Number(e.target.value))}
              />
            </fieldset>

            <fieldset className="fieldset pr-4 flex-1">
              <legend className="fieldset-legend">ค่าน้ำ : หน่วยใหม่</legend>
              <input
                type="number"
                className="input w-full"
                value={newWaterUnit}
                onChange={(e) => setNewWaterUnit(Number(e.target.value))}
              />
            </fieldset>

            <fieldset className="fieldset pr-4 flex-1">
              <legend className="fieldset-legend">รวมค่าน้ำ</legend>
              <input type="text" className="input w-full" value={totalWater.toFixed(2)} readOnly />
            </fieldset>
          </div>

          {/* ค่าอินเทอร์เน็ตและค่าเช่า */}
          <div className="flex mb-4">
            <fieldset className="fieldset pr-4 flex-1">
              <legend className="fieldset-legend">ค่าอินเทอร์เน็ต</legend>
              <input
                type="number"
                className="input w-full"
                value={defaultnet}
                onChange={(e) => setDefaultNet(Number(e.target.value))}
              />
            </fieldset>

            <fieldset className="fieldset pr-4 flex-1">
              <legend className="fieldset-legend">ค่าเช่าห้อง</legend>
              <input
                type="number"
                className="input w-full"
                value={defaultrent}
                onChange={(e) => setDefaultRent(Number(e.target.value))}
              />
            </fieldset>

            <fieldset className="fieldset pr-4 flex-2">
              <legend className="fieldset-legend">ราคารวมทั้งหมด</legend>
              <input
                type="text"
                className="input w-full text-xl font-bold"
                value={`${totalAll.toFixed(2)} บาท`}
                readOnly
              />
            </fieldset>
          </div>

          {/* ปุ่มดำเนินการ - ลบปุ่มพิมพ์ออก */}
          <div className="flex space-x-2 pb-7">
            <button className="btn btn-primary" onClick={calculateBill}>
              คำนวณ
            </button>
            <button className="btn btn-success" onClick={saveBill} disabled={totalAll <= 0}>
              <Save className="h-5 w-5 mr-1" /> บันทึก
            </button>
            <button className="btn btn-warning" onClick={resetForm}>
              รีเซ็ต
            </button>
          </div>
        </>
      )}
    </>
  )
}

// ลบ printBill จาก BillListComponent props และลบปุ่มพิมพ์
function BillListComponent({ datapayment, setDataPayment, deleteBill }) {
  return (
    <div className="overflow-y-scroll h-96">
      {datapayment.map((dataroom, index) => (
        <div key={dataroom.id || index} className="bg-base-100 border-base-300 border mb-2 rounded-lg">
          <div className="p-4 font-semibold flex items-center justify-between">
            <span>
              User: {dataroom.user} ({dataroom.room})
            </span>
            <div className="flex items-center space-x-2">
              {dataroom.status === "PENDING" && <span className="badge badge-warning mr-2">รอชำระ</span>}
              {dataroom.status === "PAID" && <span className="badge badge-success mr-2">ชำระแล้ว</span>}
              {dataroom.status === "OVERDUE" && <span className="badge badge-error mr-2">เกินกำหนด</span>}

              {/* ย้ายปุ่มมาไว้ด้านนอก collapse */}
              <button
                className="btn btn-sm btn-success"
                onClick={() => {
                  // ทำฟังก์ชันเปลี่ยนสถานะเป็นชำระแล้ว
                  const updatedPayments = datapayment.map((item) =>
                    item.id === dataroom.id ? { ...item, status: "PAID" } : item,
                  )
                  setDataPayment(updatedPayments)
                }}
                disabled={dataroom.status === "PAID"}
              >
                <CheckCircle className="h-4 w-4 mr-1" /> ชำระแล้ว
              </button>

              {/* ปุ่มลบอยู่ด้านนอก collapse */}
              {dataroom.id && (
                <button className="btn btn-sm btn-error" onClick={() => deleteBill(dataroom.id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> ลบ
                </button>
              )}
            </div>
          </div>

          {/* แยก collapse content ออกมา */}
          <details className="collapse">
            <summary className="collapse-title text-sm">ดูรายละเอียดเพิ่มเติม</summary>
            <div className="collapse-content text-sm">
              <p>รายการใบชำระค้าง:</p>
              <p>
                - {dataroom.billsnew} บาท ({dataroom.datenew})
              </p>
              {dataroom.billsold > 0 && (
                <p>
                  - {dataroom.billsold} บาท ({dataroom.dateold})
                </p>
              )}

              {dataroom.slip ? (
                <div className="mt-2">
                  <p className="mb-1">หลักฐานการชำระเงิน:</p>
                  <img src={dataroom.slip || "/placeholder.svg"} alt="ใบเสร็จ" className="w-64 h-auto rounded-lg mt-2" />
                </div>
              ) : (
                <p className="text-gray-500 mt-2">ไม่มีภาพใบเสร็จ</p>
              )}
            </div>
          </details>
        </div>
      ))}
    </div>
  )
}

