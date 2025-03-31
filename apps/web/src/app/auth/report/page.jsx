"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Search, Send, AlertTriangle } from "lucide-react"

export default function ReportPage() {
  const [residents, setResidents] = useState([])
  const [filteredResidents, setFilteredResidents] = useState([])
  const [selectedResident, setSelectedResident] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [reportType, setReportType] = useState("DISTURBING")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const token =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token") ||
          localStorage.getItem("authToken") ||
          sessionStorage.getItem("authToken")

        if (!token) {
          setError("กรุณาเข้าสู่ระบบก่อน")
          router.push("/")
          return
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

        // 1. ดึงข้อมูลผู้ใช้ปัจจุบัน
        const currentUserResponse = await axios.get(`${apiUrl}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setCurrentUser(currentUserResponse.data.user)

        // 2. ดึงข้อมูลห้องทั้งหมด (resident มีสิทธิ์เข้าถึงข้อมูลห้อง)
        const roomsResponse = await axios.get(`${apiUrl}/api/rooms`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        // สร้างรายการผู้เช่าจากข้อมูลห้อง
        const roomsWithResidents = roomsResponse.data.rooms || []
        const allResidents = []

        // แปลงข้อมูลห้องและผู้เช่าให้อยู่ในรูปแบบที่ต้องการ
        roomsWithResidents.forEach((room) => {
          if (room.residents && room.residents.length > 0) {
            room.residents.forEach((resident) => {
              // ข้ามผู้เช่าที่เป็นตัวเอง
              if (resident.userId !== currentUserResponse.data.user.id && resident.isActive) {
                allResidents.push({
                  id: resident.id,
                  userId: resident.userId,
                  displayName: resident.user?.fullName || resident.user?.username || "ผู้เช่า",
                  roomNumber: room.roomNumber || "ไม่ระบุห้อง",
                  isActive: resident.isActive,
                })
              }
            })
          }
        })

        setResidents(allResidents)
        setFilteredResidents(allResidents)
      } catch (error) {
        console.error("Error fetching data:", error)

        if (error.response && error.response.data) {
          setError(`ไม่สามารถดึงข้อมูลได้: ${error.response.data.error || error.message}`)
        } else {
          setError("ไม่สามารถดึงข้อมูลผู้เช่าได้")
        }

        // ถ้าเป็นปัญหาเรื่อง authentication ให้ redirect ไปหน้า login
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem("token")
          sessionStorage.removeItem("token")
          localStorage.removeItem("authToken")
          sessionStorage.removeItem("authToken")
          router.push("/")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  // ฟังก์ชันค้นหาผู้เช่า
  const handleSearch = (e) => {
    const term = e.target.value
    setSearchTerm(term)

    if (!term.trim()) {
      setFilteredResidents(residents)
      return
    }

    const filtered = residents.filter(
      (resident) =>
        resident.displayName.toLowerCase().includes(term.toLowerCase()) ||
        resident.roomNumber.toLowerCase().includes(term.toLowerCase()),
    )

    setFilteredResidents(filtered)
  }

  // เลือกผู้เช่าที่ต้องการรายงาน
  const handleSelectResident = (resident) => {
    setSelectedResident(resident)
    // ตั้งชื่อเรื่องอัตโนมัติตามประเภทรายงานที่เลือก
    updateReportTitle(reportType, resident)
  }

  // อัปเดตชื่อเรื่องตามประเภทรายงาน
  const updateReportTitle = (type, resident) => {
    if (!resident) return

    let typeText = ""
    switch (type) {
      case "DISTURBING":
        typeText = "รบกวน"
        break
      case "INAPPROPRIATE_BEHAVIOR":
        typeText = "พฤติกรรมไม่เหมาะสม"
        break
      case "OTHER":
        typeText = "อื่นๆ"
        break
    }

    setTitle(`${typeText} - ห้อง ${resident.roomNumber}`)
  }

  // เมื่อเปลี่ยนประเภทรายงาน
  const handleReportTypeChange = (type) => {
    setReportType(type)
    updateReportTitle(type, selectedResident)
  }

  // ส่งรายงาน
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedResident) {
      setError("กรุณาเลือกผู้เช่าที่ต้องการรายงาน")
      return
    }

    if (!title.trim()) {
      setError("กรุณาระบุหัวข้อ")
      return
    }

    if (!description.trim()) {
      setError("กรุณาระบุรายละเอียด")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken")

      if (!token) {
        setError("กรุณาเข้าสู่ระบบก่อน")
        router.push("/")
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await axios.post(
        `${apiUrl}/api/reports`,
        {
          reportedId: selectedResident.id, // ใช้ resident ID ที่ถูกต้อง
          title,
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      setSuccess("รายงานถูกส่งเรียบร้อยแล้ว")
      // รีเซ็ตฟอร์ม
      setSelectedResident(null)
      setTitle("")
      setDescription("")
      setReportType("DISTURBING")
    } catch (error) {
      console.error("Error submitting report:", error)
      setError(error.response?.data?.error || "ไม่สามารถส่งรายงานได้")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="pt-16 px-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">รายงานผู้เช่า</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* รายชื่อผู้เช่า */}
        <div className="w-full md:w-1/3 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">เลือกผู้เช่าที่ต้องการรายงาน</h2>

          <div className="relative mb-4">
            <input
              type="text"
              placeholder="ค้นหาผู้เช่า..."
              className="w-full p-2 pl-10 border rounded"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          {isLoading ? (
            <div className="text-center py-4">กำลังโหลดข้อมูล...</div>
          ) : (
            <div className="overflow-y-auto max-h-96">
              {filteredResidents.length === 0 ? (
                <div className="text-center py-4 text-gray-500">ไม่พบผู้เช่า</div>
              ) : (
                filteredResidents.map((resident) => (
                  <div
                    key={resident.id}
                    className={`flex items-center p-3 mb-2 rounded cursor-pointer ${
                      selectedResident?.id === resident.id
                        ? "bg-blue-100 border border-blue-300"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                    onClick={() => handleSelectResident(resident)}
                  >
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      {resident.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{resident.displayName}</div>
                      <div className="text-sm text-gray-600">ห้อง {resident.roomNumber}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ฟอร์มรายงาน */}
        <div className="w-full md:w-2/3 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {selectedResident
              ? `รายงานเกี่ยวกับ ${selectedResident.displayName} (ห้อง ${selectedResident.roomNumber})`
              : "กรุณาเลือกผู้เช่าที่ต้องการรายงาน"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">ประเภทรายงาน</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reportType"
                    value="DISTURBING"
                    checked={reportType === "DISTURBING"}
                    onChange={() => handleReportTypeChange("DISTURBING")}
                    className="mr-2"
                  />
                  <span>รบกวน</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reportType"
                    value="INAPPROPRIATE_BEHAVIOR"
                    checked={reportType === "INAPPROPRIATE_BEHAVIOR"}
                    onChange={() => handleReportTypeChange("INAPPROPRIATE_BEHAVIOR")}
                    className="mr-2"
                  />
                  <span>พฤติกรรมไม่เหมาะสม</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reportType"
                    value="OTHER"
                    checked={reportType === "OTHER"}
                    onChange={() => handleReportTypeChange("OTHER")}
                    className="mr-2"
                  />
                  <span>อื่นๆ</span>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                หัวข้อ
              </label>
              <input
                type="text"
                id="title"
                className="w-full p-2 border rounded"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ระบุหัวข้อรายงาน"
                disabled={!selectedResident}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                รายละเอียด
              </label>
              <textarea
                id="description"
                className="w-full p-2 border rounded h-32"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ระบุรายละเอียดของปัญหาที่ต้องการรายงาน"
                disabled={!selectedResident}
              />
            </div>

            <div className="flex justify-between items-center">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !selectedResident}
              >
                <Send className="h-5 w-5 mr-2" />
                {isLoading ? "กำลังส่ง..." : "ส่งรายงาน"}
              </button>

              <p className="text-red-500 text-sm">*****การรายงานของคุณจะถูกเก็บเป็นความลับ*****</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

