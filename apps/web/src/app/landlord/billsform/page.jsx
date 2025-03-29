"use client"

import { useState, useEffect, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import axios from "axios"
import { Printer, Save, Search, CheckCircle } from "lucide-react"

export default function Page() {
  const [datapayment, setDataPayment] = useState([])
  const [rooms, setRooms] = useState([])
  const [residents, setResidents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [utilityTypes, setUtilityTypes] = useState([])
  const [meters, setMeters] = useState([])

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

  // สำหรับการพิมพ์
  const printRef = useRef()

  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  // ดึงข้อมูลห้องและผู้เช่า
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // ดึง token
        const token = sessionStorage.getItem("authToken") || localStorage.getItem("authToken")

        if (!token) {
          setError("กรุณาเข้าสู่ระบบก่อน")
          setIsLoading(false)
          return
        }

        // ดึงข้อมูลห้อง
        const roomsResponse = await axios.get(`${url}/api/rooms`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        console.log("Rooms data:", roomsResponse.data)
        setRooms(roomsResponse.data.rooms || [])

        // ดึงข้อมูลผู้ใช้ที่เป็น RESIDENT
        const usersResponse = await axios.get(`${url}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const residentUsers = usersResponse.data.users?.filter((user) => user.role === "RESIDENT") || []
        console.log("Resident users:", residentUsers)
        setResidents(residentUsers)

        // ดึงข้อมูลประเภทสาธารณูปโภค
        try {
          const utilityTypesResponse = await axios.get(`${url}/api/setup/utility-types`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          console.log("Utility types:", utilityTypesResponse.data)
          setUtilityTypes(utilityTypesResponse.data.utilityTypes || [])
        } catch (err) {
          console.warn("Could not fetch utility types:", err)
          // ใช้ข้อมูลจำลอง
          setUtilityTypes([
            { id: "water", name: "Water", unit: "ลบ.ม." },
            { id: "electricity", name: "Electricity", unit: "หน่วย" },
            { id: "internet", name: "Internet", unit: "เดือน" },
            { id: "rent", name: "Rent", unit: "เดือน" },
          ])
        }

        // ดึงข้อมูลใบชำระเดิม (ถ้ามี API)
        try {
          const billsResponse = await axios.get(`${url}/api/bills`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          console.log("Bills data:", billsResponse.data)
          setDataPayment(billsResponse.data.bills || [])
        } catch (err) {
          console.warn("Could not fetch bills, using mock data:", err)
          // ใช้ข้อมูลจำลองถ้าไม่มี API
          setDataPayment([
            {
              id: "1",
              user: "Copter",
              room: 123,
              billsnew: 4521.23,
              billsold: 4643.35,
              dateold: "06/11/2568",
              datenew: "06/12/2568",
              slip: "https://scontent.fbkk5-6.fna.fbcdn.net/v/t1.15752-9/480951741_951350990101887_201108737866095354_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=9f807c&_nc_ohc=D4VnPqmzElMQ7kNvgExlL1g&_nc_oc=AdiYDXcYHnWytBpy9_Ix5cR-8JxT43sHCCaAxTFhvi6mRF567UfYUe9w8b1wi8hzLe0&_nc_zt=23&_nc_ht=scontent.fbkk5-6.fna&oh=03_Q7cD1wFcWtHTUZrD0fHOlWNB_s8isj5fzozQv9msTwznlCEoLA&oe=67F3ACB2",
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
              slip: "https://scontent.fbkk5-6.fna.fbcdn.net/v/t1.15752-9/480951741_951350990101887_201108737866095354_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=9f807c&_nc_ohc=D4VnPqmzElMQ7kNvgExlL1g&_nc_oc=AdiYDXcYHnWytBpy9_Ix5cR-8JxT43sHCCaAxTFhvi6mRF567UfYUe9w8b1wi8hzLe0&_nc_zt=23&_nc_ht=scontent.fbkk5-6.fna&oh=03_Q7cD1wFcWtHTUZrD0fHOlWNB_s8isj5fzozQv9msTwznlCEoLA&oe=67F3ACB2",
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
              slip: "https://scontent.fbkk5-6.fna.fbcdn.net/v/t1.15752-9/480951741_951350990101887_201108737866095354_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=9f807c&_nc_ohc=D4VnPqmzElMQ7kNvgExlL1g&_nc_oc=AdiYDXcYHnWytBpy9_Ix5cR-8JxT43sHCCaAxTFhvi6mRF567UfYUe9w8b1wi8hzLe0&_nc_zt=23&_nc_ht=scontent.fbkk5-6.fna&oh=03_Q7cD1wFcWtHTUZrD0fHOlWNB_s8isj5fzozQv9msTwznlCEoLA&oe=67F3ACB2",
              status: "OVERDUE",
            },
          ])
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล: " + (err.response?.data?.error || err.message))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [url])

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
      const resident = residents.find((r) => r.id === roomResidents[0].userId)
      setSelectedResident(resident)
    } else {
      setSelectedResident(null)
    }

    try {
      const token = sessionStorage.getItem("authToken") || localStorage.getItem("authToken")

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
    setDefaultRent(room.baseRent || 3000)
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
      const token = sessionStorage.getItem("authToken") || localStorage.getItem("authToken")

      if (!token) {
        alert("กรุณาเข้าสู่ระบบก่อน")
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

      // สร้างข้อมูลใบชำระ
      const billData = {
        residentId: selectedResident.residentId || selectedResident.id,
        residentName: selectedResident.fullName,
        roomNumber: selectedRoom.roomNumber,
        totalAmount: totalAll,
        billingPeriodStart: new Date(billDate).toISOString(),
        billingPeriodEnd: new Date(billDate).toISOString(),
        dueDate: new Date(dueDate).toISOString(),
        billItems: [
          {
            utilityTypeId:
              utilityTypes.find(
                (t) =>
                  t.name.toLowerCase() === "water" ||
                  t.name.toLowerCase() === "น้ำ" ||
                  t.name.toLowerCase() === "น้ำประปา",
              )?.id || "water",
            amount: totalWater,
            unitUsed: Number(newWaterUnit) - Number(oldWaterUnit),
            rate: defaultwater,
            description: "ค่าน้ำประปา",
          },
          {
            utilityTypeId:
              utilityTypes.find((t) => t.name.toLowerCase() === "electricity" || t.name.toLowerCase() === "ไฟฟ้า")?.id ||
              "electricity",
            amount: totalElectricity,
            unitUsed: Number(newElectricityUnit) - Number(oldElectricityUnit),
            rate: defaultelectricity,
            description: "ค่าไฟฟ้า",
          },
          {
            utilityTypeId:
              utilityTypes.find((t) => t.name.toLowerCase() === "internet" || t.name.toLowerCase() === "อินเทอร์เน็ต")
                ?.id || "internet",
            amount: defaultnet,
            unitUsed: 1,
            rate: defaultnet,
            description: "ค่าอินเทอร์เน็ต",
          },
          {
            utilityTypeId:
              utilityTypes.find(
                (t) =>
                  t.name.toLowerCase() === "rent" || t.name.toLowerCase() === "เช่า" || t.name.toLowerCase() === "ค่าเช่า",
              )?.id || "rent",
            amount: defaultrent,
            unitUsed: 1,
            rate: defaultrent,
            description: "ค่าเช่าห้อง",
          },
        ],
      }

      console.log("Saving bill:", billData)

      // ส่งข้อมูลไปยัง API
      try {
        console.log("Sending bill data to API:", billData)
        console.log("API URL:", `${url}/api/bills`)
        console.log("Token:", token.substring(0, 20) + "...")

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

        // ถ้าไม่สามารถบันทึกบิลได้ ให้แสดงข้อความแจ้งเตือนและใช้ข้อมูลจำลอง
        alert(`เกิดข้อผิดพลาดในการบันทึกบิล: ${err.response?.data?.error || err.message}`)

        // ใช้ข้อมูลจำลอง
        const newBill = {
          id: `temp-${Date.now()}`,
          user: selectedResident?.fullName || "ผู้เช่าห้อง " + roomNumber,
          room: Number.parseInt(roomNumber),
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
      }
    } catch (err) {
      console.error("Error in save process:", err)
      alert("เกิดข้อผิดพลาดในการบันทึก: " + (err.response?.data?.error || err.message))
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

  // ฟังก์ชันสำหรับพิมพ์ใบชำระ
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `ใบชำระค่าเช่าห้อง ${selectedRoom?.roomNumber || roomNumber}`,
  })

  // ฟังก์ชันสำหรับพิมพ์ใบชำระเฉพาะรายการ
  const printBill = (bill) => {
    // ตั้งค่าข้อมูลสำหรับพิมพ์
    setRoomNumber(bill.room.toString())
    setSelectedRoom({ roomNumber: bill.room })
    setSelectedResident({ fullName: bill.user })
    setOldWaterUnit(bill.old_water_unit || 0)
    setOldElectricityUnit(bill.old_ele_unit || 0)
    setNewWaterUnit(bill.new_water_unit || 0)
    setNewElectricityUnit(bill.new_ele_unit || 0)
    setTotalAll(bill.billsnew)

    // เรียกฟังก์ชันพิมพ์หลังจากข้อมูลถูกตั้งค่า
    setTimeout(() => {
      handlePrint()
    }, 100)
  }

  // แสดงสถานะการโหลด
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // แสดงข้อผิดพลาด
  if (error) {
    return (
      <div className="p-6 min-h-screen">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 px-6 min-h-screen">
      <div className="flex flex-wrap md:flex-nowrap space-y-4 md:space-y-0 md:space-x-4">
        {/* Bill form card */}
        <div className="md:col-span-2 p-6 rounded-lg shadow-2xl text-base-content w-full">
          <h1 className="text-4xl font-bold text-base-content mb-6">กรอกแบบฟอร์มใบชำระเงิน</h1>

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
                  <Search className="h-5 w-5 mr-1" /> ค้นหา
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

              {/* ปุ่มดำเนินการ */}
              <div className="flex space-x-2 pb-7">
                <button className="btn btn-primary" onClick={calculateBill}>
                  คำนวณ
                </button>
                <button className="btn btn-success" onClick={saveBill} disabled={totalAll <= 0}>
                  <Save className="h-5 w-5 mr-1" /> บันทึก
                </button>
                <button className="btn btn-info" onClick={handlePrint} disabled={totalAll <= 0}>
                  <Printer className="h-5 w-5 mr-1" /> พิมพ์
                </button>
                <button className="btn btn-warning" onClick={resetForm}>
                  รีเซ็ต
                </button>
              </div>
            </>
          )}

          {/* ส่วนที่ซ่อนไว้สำหรับการพิมพ์ */}
          <div className="hidden">
            <div ref={printRef} className="p-8 bg-white text-black">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">ใบแจ้งค่าเช่าและค่าบริการ</h1>
                <h2 className="text-xl">S.T. APARTMENT</h2>
                <p>วันที่ออกบิล: {new Date(billDate).toLocaleDateString("th-TH")}</p>
                <p>วันครบกำหนดชำระ: {new Date(dueDate).toLocaleDateString("th-TH")}</p>
              </div>

              <div className="mb-4">
                <h3 className="font-bold">ข้อมูลผู้เช่า</h3>
                <p>ห้อง: {selectedRoom?.roomNumber}</p>
                <p>ชื่อผู้เช่า: {selectedResident?.fullName || "ไม่ระบุ"}</p>
              </div>

              <table className="w-full border-collapse mb-4">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="text-left p-2">รายการ</th>
                    <th className="text-right p-2">หน่วยเก่า</th>
                    <th className="text-right p-2">หน่วยใหม่</th>
                    <th className="text-right p-2">หน่วยที่ใช้</th>
                    <th className="text-right p-2">ราคาต่อหน่วย</th>
                    <th className="text-right p-2">จำนวนเงิน</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="p-2">ค่าน้ำประปา</td>
                    <td className="text-right p-2">{oldWaterUnit}</td>
                    <td className="text-right p-2">{newWaterUnit}</td>
                    <td className="text-right p-2">{Math.max(0, newWaterUnit - oldWaterUnit)}</td>
                    <td className="text-right p-2">{defaultwater}</td>
                    <td className="text-right p-2">{totalWater.toFixed(2)}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="p-2">ค่าไฟฟ้า</td>
                    <td className="text-right p-2">{oldElectricityUnit}</td>
                    <td className="text-right p-2">{newElectricityUnit}</td>
                    <td className="text-right p-2">{Math.max(0, newElectricityUnit - oldElectricityUnit)}</td>
                    <td className="text-right p-2">{defaultelectricity}</td>
                    <td className="text-right p-2">{totalElectricity.toFixed(2)}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="p-2">ค่าอินเทอร์เน็ต</td>
                    <td className="text-right p-2">-</td>
                    <td className="text-right p-2">-</td>
                    <td className="text-right p-2">1</td>
                    <td className="text-right p-2">{defaultnet}</td>
                    <td className="text-right p-2">{defaultnet.toFixed(2)}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="p-2">ค่าเช่าห้อง</td>
                    <td className="text-right p-2">-</td>
                    <td className="text-right p-2">-</td>
                    <td className="text-right p-2">1</td>
                    <td className="text-right p-2">{defaultrent}</td>
                    <td className="text-right p-2">{defaultrent.toFixed(2)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="font-bold">
                    <td colSpan="5" className="text-right p-2">
                      รวมทั้งสิ้น
                    </td>
                    <td className="text-right p-2">{totalAll.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>

              <div className="mt-8 flex justify-between">
                <div>
                  <p className="mb-16">ลงชื่อ ________________________</p>
                  <p className="text-center">ผู้จัดการหอพัก</p>
                </div>
                <div>
                  <p className="mb-16">ลงชื่อ ________________________</p>
                  <p className="text-center">ผู้เช่า</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-body shadow-2xl w-4xl rounded-lg">
          <div className="flex items-center rounded-lg">
            <div className="text-4xl font-bold text-base-content mb-6">รายการใบชำระ</div>
          </div>
          <div className="overflow-y-scroll h-96">
            {datapayment.map((dataroom, index) => (
              <div
                key={dataroom.id || index}
                tabIndex={0}
                className="collapse collapse-plus bg-base-100 border-base-300 border mb-2"
              >
                <div className="collapse-title font-semibold flex items-center">
                  <span>
                    User: {dataroom.user} ({dataroom.room})
                  </span>
                  <div className="ml-auto flex items-center">
                    {dataroom.status === "PENDING" && <span className="badge badge-warning mr-2">รอชำระ</span>}
                    {dataroom.status === "PAID" && <span className="badge badge-success mr-2">ชำระแล้ว</span>}
                    {dataroom.status === "OVERDUE" && <span className="badge badge-error mr-2">เกินกำหนด</span>}
                  </div>
                </div>
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

                  <div className="flex justify-end mt-4 space-x-2">
                    <button className="btn btn-sm btn-info" onClick={() => printBill(dataroom)}>
                      <Printer className="h-4 w-4 mr-1" /> พิมพ์
                    </button>
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
                  </div>

                  {dataroom.slip ? (
                    <div className="mt-2">
                      <p className="mb-1">หลักฐานการชำระเงิน:</p>
                      <img
                        src={dataroom.slip || "/placeholder.svg"}
                        alt="ใบเสร็จ"
                        className="w-64 h-auto rounded-lg mt-2"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-500 mt-2">ไม่มีภาพใบเสร็จ</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

