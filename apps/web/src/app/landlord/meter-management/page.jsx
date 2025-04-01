"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Save, Edit, Trash2, Search, Loader2 } from "lucide-react"
import axios from "axios"

export default function MeterManagementPage() {
  const router = useRouter()
  const [rooms, setRooms] = useState([])
  const [utilityTypes, setUtilityTypes] = useState([])
  const [meters, setMeters] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [token, setToken] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // Meter form state
  const [showMeterForm, setShowMeterForm] = useState(false)
  const [meterForm, setMeterForm] = useState({
    roomId: "",
    utilityTypeId: "",
    meterNumber: "",
    initialReading: "0",
    isActive: true,
  })
  const [editingMeterId, setEditingMeterId] = useState(null)

  // Reading form state
  const [showReadingForm, setShowReadingForm] = useState(false)
  const [readingForm, setReadingForm] = useState({
    meterId: "",
    reading: "",
    readingDate: new Date().toISOString().split("T")[0],
    note: "",
  })
  const [selectedMeter, setSelectedMeter] = useState(null)

  const baseUrl = process.env.NEXT_PUBLIC_API_URL

  // Fetch token on component mount
  useEffect(() => {
    const storedToken = sessionStorage.getItem("authToken") || localStorage.getItem("authToken") || ""
    setToken(storedToken)
  }, [])

  // Fetch data when token is available
  useEffect(() => {
    if (!token) return

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch rooms
        const roomsResponse = await axios.get(`${baseUrl}/api/rooms`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setRooms(roomsResponse.data.rooms || [])

        // Fetch utility types
        try {
          // เรียกใช้ API จริงเพื่อดึงข้อมูลประเภทสาธารณูปโภค
          const utilityTypesResponse = await axios.get(`${baseUrl}/api/setup/utility-types`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          console.log("Fetched utility types:", utilityTypesResponse.data)

          // ตรวจสอบว่ามีข้อมูลหรือไม่
          if (!utilityTypesResponse.data.utilityTypes || utilityTypesResponse.data.utilityTypes.length === 0) {
            // ถ้าไม่มีข้อมูล ให้แสดงข้อความแจ้งเตือน
            setError("ไม่พบข้อมูลประเภทสาธารณูปโภค กรุณาตั้งค่าข้อมูลพื้นฐานก่อนใช้งาน")

            // ใช้ข้อมูลจำลองแทน
            setUtilityTypes([
              { id: "water", name: "น้ำประปา", unit: "ลบ.ม." },
              { id: "electricity", name: "ไฟฟ้า", unit: "หน่วย" },
              { id: "internet", name: "อินเทอร์เน็ต", unit: "เดือน" },
            ])
          } else {
            setUtilityTypes(utilityTypesResponse.data.utilityTypes || [])
          }
        } catch (err) {
          console.error("Error fetching utility types:", err)
          // ใช้ข้อมูลจำลองเป็นแผนสำรองในกรณีที่ API มีปัญหา
          setUtilityTypes([
            { id: "water", name: "น้ำประปา", unit: "ลบ.ม." },
            { id: "electricity", name: "ไฟฟ้า", unit: "หน่วย" },
            { id: "internet", name: "อินเทอร์เน็ต", unit: "เดือน" },
          ])
          setError((prevError) => prevError || "ไม่สามารถดึงข้อมูลประเภทสาธารณูปโภคได้")
        }

        // Fetch all meters
        const allMeters = []
        for (const room of roomsResponse.data.rooms || []) {
          if (room.meters && room.meters.length > 0) {
            allMeters.push(
              ...room.meters.map((meter) => ({
                ...meter,
                roomNumber: room.roomNumber,
                floor: room.floor,
                building: room.building,
              })),
            )
          }
        }
        setMeters(allMeters)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล: " + (err.response?.data?.error || err.message))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [token, baseUrl])

  // Handle meter form input changes
  const handleMeterFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setMeterForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // Handle reading form input changes
  const handleReadingFormChange = (e) => {
    const { name, value } = e.target
    setReadingForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Reset meter form
  const resetMeterForm = () => {
    setMeterForm({
      roomId: "",
      utilityTypeId: "",
      meterNumber: "",
      initialReading: "0",
      isActive: true,
    })
    setEditingMeterId(null)
  }

  // Reset reading form
  const resetReadingForm = () => {
    setReadingForm({
      meterId: "",
      reading: "",
      readingDate: new Date().toISOString().split("T")[0],
      note: "",
    })
    setSelectedMeter(null)
  }

  // Handle meter form submission
  const handleMeterSubmit = async (e) => {
    e.preventDefault()

    if (!token) {
      alert("กรุณาเข้าสู่ระบบก่อน")
      return
    }

    try {
      const meterData = {
        roomId: meterForm.roomId,
        utilityTypeId: meterForm.utilityTypeId,
        meterNumber: meterForm.meterNumber,
        initialReading: meterForm.initialReading ? Number.parseFloat(meterForm.initialReading) : 0,
        isActive: meterForm.isActive,
      }

      console.log("Sending meter data:", meterData)

      let response

      if (editingMeterId) {
        // Update existing meter
        response = await axios.put(`${baseUrl}/api/meters/${editingMeterId}`, meterData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        // Update meters list
        setMeters(
          meters.map((meter) =>
            meter.id === editingMeterId
              ? {
                  ...response.data.meter,
                  roomNumber: rooms.find((r) => r.id === meterForm.roomId)?.roomNumber,
                  floor: rooms.find((r) => r.id === meterForm.roomId)?.floor,
                  building: rooms.find((r) => r.id === meterForm.roomId)?.building,
                }
              : meter,
          ),
        )

        alert("อัปเดตมิเตอร์สำเร็จ")
      } else {
        // Create new meter
        response = await axios.post(`${baseUrl}/api/meters`, meterData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        console.log("Server response:", response.data)

        // Add new meter to list
        const newMeter = {
          ...response.data.meter,
          roomNumber: rooms.find((r) => r.id === meterForm.roomId)?.roomNumber,
          floor: rooms.find((r) => r.id === meterForm.roomId)?.floor,
          building: rooms.find((r) => r.id === meterForm.roomId)?.building,
        }
        setMeters([...meters, newMeter])

        alert("สร้างมิเตอร์ใหม่สำเร็จ")
      }

      // Reset form and close it
      resetMeterForm()
      setShowMeterForm(false)
    } catch (err) {
      console.error("Error saving meter:", err)

      let errorMessage = "เกิดข้อผิดพลาด"

      if (err.response) {
        console.error("Error response:", err.response.data)
        errorMessage += `: ${err.response.data.error || err.response.data.details || err.message}`
      } else {
        errorMessage += `: ${err.message}`
      }

      alert(errorMessage)
    }
  }

  // Handle reading form submission
  const handleReadingSubmit = async (e) => {
    e.preventDefault()

    if (!token) {
      alert("กรุณาเข้าสู่ระบบก่อน")
      return
    }

    try {
      const readingData = {
        meterId: readingForm.meterId,
        reading: Number.parseFloat(readingForm.reading),
        readingDate: new Date(readingForm.readingDate).toISOString(),
        note: readingForm.note,
      }

      const response = await axios.post(`${baseUrl}/api/meter-readings`, readingData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      alert("บันทึกค่ามิเตอร์สำเร็จ")

      // Reset form and close it
      resetReadingForm()
      setShowReadingForm(false)

      // Refresh meters to show updated readings
      const roomsResponse = await axios.get(`${baseUrl}/api/rooms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const allMeters = []
      for (const room of roomsResponse.data.rooms || []) {
        if (room.meters && room.meters.length > 0) {
          allMeters.push(
            ...room.meters.map((meter) => ({
              ...meter,
              roomNumber: room.roomNumber,
              floor: room.floor,
              building: room.building,
            })),
          )
        }
      }
      setMeters(allMeters)
    } catch (err) {
      console.error("Error saving meter reading:", err)
      alert(`เกิดข้อผิดพลาด: ${err.response?.data?.error || err.message}`)
    }
  }

  // Edit meter
  const handleEditMeter = (meter) => {
    setMeterForm({
      roomId: meter.roomId,
      utilityTypeId: meter.utilityTypeId,
      meterNumber: meter.meterNumber,
      initialReading: meter.initialReading?.toString() || "0",
      isActive: meter.isActive,
    })
    setEditingMeterId(meter.id)
    setShowMeterForm(true)
  }

  // Delete meter
  const handleDeleteMeter = async (meterId) => {
    if (!window.confirm("คุณต้องการลบมิเตอร์นี้ใช่หรือไม่? การลบมิเตอร์จะลบประวัติการอ่านมิเตอร์ทั้งหมดด้วย")) {
      return
    }

    try {
      await axios.delete(`${baseUrl}/api/meters/${meterId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Remove meter from list
      setMeters(meters.filter((meter) => meter.id !== meterId))
      alert("ลบมิเตอร์สำเร็จ")
    } catch (err) {
      console.error("Error deleting meter:", err)
      alert(`เกิดข้อผิดพลาด: ${err.response?.data?.error || err.message}`)
    }
  }

  // Add reading
  const handleAddReading = (meter) => {
    setReadingForm({
      meterId: meter.id,
      reading: "",
      readingDate: new Date().toISOString().split("T")[0],
      note: `บันทึกค่ามิเตอร์ ${meter.utilityType.name} ห้อง ${meter.roomNumber}`,
    })
    setSelectedMeter(meter)
    setShowReadingForm(true)
  }

  // Filter meters based on search term
  const filteredMeters = meters.filter(
    (meter) =>
      meter.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meter.meterNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meter.utilityType?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-4xl font-bold text-base-content mb-6">จัดการมิเตอร์</h1>

      <div className="bg-base-100 p-6 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 w-full max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="ค้นหามิเตอร์..."
                className="input input-bordered w-full pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetMeterForm()
              setShowMeterForm(true)
            }}
          >
            <Plus className="h-5 w-5 mr-2" /> เพิ่มมิเตอร์ใหม่
          </button>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {/* Meter Form */}
        {showMeterForm && (
          <div className="card bg-base-200 shadow-md mb-6">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">{editingMeterId ? "แก้ไขข้อมูลมิเตอร์" : "เพิ่มมิเตอร์ใหม่"}</h2>
              <form onSubmit={handleMeterSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">ห้อง *</span>
                    </label>
                    <select
                      name="roomId"
                      className="select select-bordered w-full"
                      value={meterForm.roomId}
                      onChange={handleMeterFormChange}
                      required
                    >
                      <option value="" disabled>
                        เลือกห้อง
                      </option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.roomNumber} (ชั้น {room.floor}
                          {room.building ? `, อาคาร ${room.building}` : ""})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">ประเภทมิเตอร์ *</span>
                    </label>
                    <select
                      name="utilityTypeId"
                      className="select select-bordered w-full"
                      value={meterForm.utilityTypeId}
                      onChange={handleMeterFormChange}
                      required
                    >
                      <option value="" disabled>
                        เลือกประเภทมิเตอร์
                      </option>
                      {utilityTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name} ({type.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">หมายเลขมิเตอร์ *</span>
                    </label>
                    <input
                      type="text"
                      name="meterNumber"
                      className="input input-bordered"
                      value={meterForm.meterNumber}
                      onChange={handleMeterFormChange}
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">ค่าเริ่มต้น *</span>
                    </label>
                    <input
                      type="number"
                      name="initialReading"
                      className="input input-bordered"
                      value={meterForm.initialReading}
                      onChange={handleMeterFormChange}
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-2">
                      <input
                        type="checkbox"
                        name="isActive"
                        className="checkbox"
                        checked={meterForm.isActive}
                        onChange={handleMeterFormChange}
                      />
                      <span className="label-text">มิเตอร์ใช้งานได้</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      resetMeterForm()
                      setShowMeterForm(false)
                    }}
                  >
                    ยกเลิก
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Save className="h-5 w-5 mr-2" />
                    {editingMeterId ? "อัปเดต" : "บันทึก"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reading Form */}
        {showReadingForm && selectedMeter && (
          <div className="card bg-base-200 shadow-md mb-6">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">
                บันทึกค่ามิเตอร์ {selectedMeter.utilityType.name} ห้อง {selectedMeter.roomNumber}
              </h2>
              <form onSubmit={handleReadingSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">ค่ามิเตอร์ *</span>
                    </label>
                    <input
                      type="number"
                      name="reading"
                      className="input input-bordered"
                      value={readingForm.reading}
                      onChange={handleReadingFormChange}
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">วันที่อ่านมิเตอร์ *</span>
                    </label>
                    <input
                      type="date"
                      name="readingDate"
                      className="input input-bordered"
                      value={readingForm.readingDate}
                      onChange={handleReadingFormChange}
                      required
                    />
                  </div>
                  <div className="form-control md:col-span-2">
                    <label className="label">
                      <span className="label-text">บันทึกเพิ่มเติม</span>
                    </label>
                    <textarea
                      name="note"
                      className="textarea textarea-bordered h-24"
                      value={readingForm.note}
                      onChange={handleReadingFormChange}
                    ></textarea>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      resetReadingForm()
                      setShowReadingForm(false)
                    }}
                  >
                    ยกเลิก
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Save className="h-5 w-5 mr-2" /> บันทึกค่ามิเตอร์
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Meters Table */}
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>ห้อง</th>
                <th>ประเภทมิเตอร์</th>
                <th>หมายเลขมิเตอร์</th>
                <th>ค่าล่าสุด</th>
                <th>วันที่อ่านล่าสุด</th>
                <th>สถานะ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredMeters.length > 0 ? (
                filteredMeters.map((meter) => (
                  <tr key={meter.id}>
                    <td>
                      {meter.roomNumber} (ชั้น {meter.floor}
                      {meter.building ? `, อาคาร ${meter.building}` : ""})
                    </td>
                    <td>{meter.utilityType?.name || "-"}</td>
                    <td>{meter.meterNumber}</td>
                    <td>
                      {meter.meterReadings && meter.meterReadings.length > 0
                        ? meter.meterReadings[0].reading
                        : meter.initialReading || "0"}{" "}
                      {meter.utilityType?.unit}
                    </td>
                    <td>
                      {meter.meterReadings && meter.meterReadings.length > 0
                        ? new Date(meter.meterReadings[0].readingDate).toLocaleDateString("th-TH")
                        : "-"}
                    </td>
                    <td>
                      <span className={`badge ${meter.isActive ? "badge-success" : "badge-error"}`}>
                        {meter.isActive ? "ใช้งานได้" : "ไม่ใช้งาน"}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-sm btn-primary" onClick={() => handleAddReading(meter)}>
                          บันทึกค่า
                        </button>
                        <button className="btn btn-sm btn-circle btn-ghost" onClick={() => handleEditMeter(meter)}>
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="btn btn-sm btn-circle btn-ghost text-error"
                          onClick={() => handleDeleteMeter(meter.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    {searchTerm ? "ไม่พบมิเตอร์ที่ตรงกับการค้นหา" : "ยังไม่มีข้อมูลมิเตอร์"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

