"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { AlertCircle } from 'lucide-react'
import Link from "next/link"
import { Loader2 } from 'lucide-react'

export default function HomePage() {
  const [currentBill, setCurrentBill] = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [activeTab, setActiveTab] = useState("home")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)
  const router = useRouter()
  const [userData, setUserData] = useState(null)
  const [billData, setBillData] = useState(null)
  // เพิ่มตัวแปรสำหรับเก็บข้อมูลห้องจาก API profile
  const [userRoomNumber, setUserRoomNumber] = useState(null)

  // เพิ่มตัวแปรสำหรับการตรวจสอบ slip
  const [isVerifyingSlip, setIsVerifyingSlip] = useState(false)
  const [slipVerificationResult, setSlipVerificationResult] = useState(null)

  // เพิ่มตัวแปรสำหรับตรวจสอบการเชื่อมต่อ API
  const [apiConnected, setApiConnected] = useState(true)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    setApiConnected(true)

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

      // ตรวจสอบการเชื่อมต่อกับ API ก่อน
      try {
        console.log("Checking API connection...")
        await axios.get(`${apiUrl}`, { timeout: 5000 })
        console.log("API connection successful")
      } catch (connectionError) {
        console.error("API connection error:", connectionError)
        setApiConnected(false)
        setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อหรือลองใหม่ภายหลัง")
        setIsLoading(false)
        return
      }

      // เพิ่มการเรียก API /api/users/profile เพื่อดึงข้อมูลห้อง
      try {
        console.log("Fetching user profile from:", `${apiUrl}/api/users/profile`)
        const profileResponse = await axios.get(`${apiUrl}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        console.log("User profile data:", profileResponse.data)
        
        // ตรวจสอบโครงสร้างข้อมูลที่ได้รับ
        if (profileResponse.data && profileResponse.data.user) {
          // ถ้าข้อมูลอยู่ใน user
          setUserData(profileResponse.data.user)
          
          // ตรวจสอบว่ามีข้อมูลห้องหรือไม่
          if (profileResponse.data.user.resident && profileResponse.data.user.resident.room) {
            setUserRoomNumber(profileResponse.data.user.resident.room.roomNumber)
          } else if (profileResponse.data.user.roomNumber) {
            setUserRoomNumber(profileResponse.data.user.roomNumber)
          }
          
          // บันทึกข้อมูลลง localStorage
          localStorage.setItem("user", JSON.stringify(profileResponse.data.user))
        } else {
          // ถ้าข้อมูลไม่ได้อยู่ใน user
          setUserData(profileResponse.data)
          
          // ตรวจสอบว่ามีข้อมูลห้องหรือไม่
          if (profileResponse.data.resident && profileResponse.data.resident.room) {
            setUserRoomNumber(profileResponse.data.resident.room.roomNumber)
          } else if (profileResponse.data.roomNumber) {
            setUserRoomNumber(profileResponse.data.roomNumber)
          }
          
          // บันทึกข้อมูลลง localStorage
          localStorage.setItem("user", JSON.stringify(profileResponse.data))
        }
        
        // แสดงโครงสร้างข้อมูลทั้งหมดเพื่อตรวจสอบ
        console.log("Full user data structure:", JSON.stringify(profileResponse.data, null, 2))
      } catch (profileError) {
        console.error("Error fetching user profile:", profileError)
        // ถ้าเรียก API ไม่สำเร็จ ให้ใช้ข้อมูลจาก localStorage
        try {
          const userDataFromStorage = JSON.parse(localStorage.getItem("user") || "{}")
          console.log("User data from localStorage:", userDataFromStorage)
          setUserData(userDataFromStorage)
        } catch (storageError) {
          console.error("Error parsing user data from localStorage:", storageError)
          setUserData({})
        }
      }

      // ดึงข้อมูลห้องโดยตรง (ถ้ายังไม่มีข้อมูลห้อง)
      if (!userRoomNumber) {
        try {
          console.log("Fetching rooms data...")
          const roomsResponse = await axios.get(`${apiUrl}/api/rooms`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          
          console.log("Rooms data:", roomsResponse.data)
          
          // ตรวจสอบว่ามีข้อมูลห้องหรือไม่
          if (roomsResponse.data && roomsResponse.data.rooms) {
            // หาห้องที่ตรงกับผู้ใช้ปัจจุบัน (ถ้ามี userId)
            if (userData && userData.id) {
              const userRoom = roomsResponse.data.rooms.find(room => 
                room.resident && room.resident.userId === userData.id
              )
              
              if (userRoom) {
                console.log("Found user room:", userRoom)
                setUserRoomNumber(userRoom.roomNumber)
                localStorage.setItem("roomNumber", userRoom.roomNumber)
              }
            }
          }
        } catch (roomsError) {
          console.error("Error fetching rooms data:", roomsError)
        }
      }

      // ดึงบิลปัจจุบัน
      try {
        console.log("Fetching bills from:", `${apiUrl}/api/bills`)
        const allBillsResponse = await axios.get(`${apiUrl}/api/bills`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        console.log("All bills data:", allBillsResponse.data)

        // กรองเอาเฉพาะบิลที่ยังไม่ได้ชำระเงิน (PENDING, OVERDUE, PROCESSING)
        const pendingBills = allBillsResponse.data.bills.filter(
          (bill) => bill.status === "PENDING" || bill.status === "OVERDUE" || bill.status === "PROCESSING",
        )

        // เรียงลำดับตามวันที่สร้าง (ล่าสุดก่อน)
        pendingBills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

        // ใช้บิลล่าสุดที่ยังไม่ได้ชำระเป็นบิลปัจจุบัน
        if (pendingBills.length > 0) {
          setCurrentBill(pendingBills[0])
        } else {
          setCurrentBill(null)
        }
      } catch (error) {
        console.error("Error fetching bills:", error)
        setCurrentBill(null)

        // ถ้าเป็นข้อผิดพลาดเกี่ยวกับการเชื่อมต่อ ให้แสดงข้อความ
        if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
          setApiConnected(false)
        }
      }

      // ดึงประกาศ
      try {
        const announcementsResponse = await axios.get(`${apiUrl}/api/announcements`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        console.log("Announcements data:", announcementsResponse.data)
        setAnnouncements(announcementsResponse.data.announcements || [])
      } catch (announcementError) {
        console.error("Error fetching announcements:", announcementError)
        setAnnouncements([])
      }

      // ดึงข้อมูลบิลค่าเช่า
      try {
        console.log("Fetching bills from:", `${apiUrl}/api/bills`)
        const billsResponse = await axios.get(`${apiUrl}/api/bills`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        console.log("Bills data:", billsResponse.data)

        // กรองเอาเฉพาะบิลที่ยังไม่ได้ชำระเงิน (PENDING, OVERDUE, PROCESSING)
        const pendingBills = billsResponse.data.bills.filter(
          (bill) => bill.status === "PENDING" || bill.status === "OVERDUE" || bill.status === "PROCESSING",
        )

        // เรียงลำดับตามวันที่สร้าง (ล่าสุดก่อน)
        pendingBills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

        // ใช้บิลล่าสุดที่ยังไม่ได้ชำระเป็นบิลปัจจุบัน
        if (pendingBills.length > 0) {
          const currentBill = pendingBills[0]
          setBillData({
            id: currentBill.id,
            roomNumber: currentBill.resident?.room?.roomNumber,
            residentName: currentBill.resident?.user?.fullName,
            totalAmount: currentBill.totalAmount,
            dueDate: currentBill.dueDate,
            status: currentBill.status,
            createdAt: currentBill.createdAt,
          })
          
          // ถ้ามีข้อมูลห้องจากบิล ให้บันทึกไว้
          if (currentBill.resident?.room?.roomNumber) {
            setUserRoomNumber(currentBill.resident.room.roomNumber)
            localStorage.setItem("roomNumber", currentBill.resident.room.roomNumber)
          }
        } else {
          setBillData(null)
        }
      } catch (billError) {
        console.error("Error fetching bill data:", billError)
        setBillData(null)
      }
    } catch (error) {
      console.error("Error in fetchData:", error)

      // ถ้าเป็นปัญหาเรื่อง authentication ให้ redirect ไปหน้า login
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem("token")
        sessionStorage.removeItem("token")
        localStorage.removeItem("authToken")
        sessionStorage.removeItem("authToken")
        router.push("/")
      }

      // ถ้าเป็นปัญหาเรื่องการเชื่อมต่อ
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        setApiConnected(false)
        setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อหรือลองใหม่ภายหลัง")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // ฟังก์ชันสำหรับกรอกเลขห้องเอง
  const handleSetRoomNumber = () => {
    const roomNumber = prompt("กรุณากรอกเลขห้องของคุณ:")
    if (roomNumber) {
      localStorage.setItem("roomNumber", roomNumber)
      setUserRoomNumber(roomNumber)
    }
  }

  // ฟอร์แมตวันที่
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // ฟอร์แมตจำนวนเงิน
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // ฟังก์ชันสำหรับออกจากระบบ
  const handleLogout = () => {
    localStorage.removeItem("token")
    sessionStorage.removeItem("token")
    localStorage.removeItem("authToken")
    sessionStorage.removeItem("authToken")
    localStorage.removeItem("user")
    localStorage.removeItem("roomNumber")
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-2 text-lg">กำลังโหลดข้อมูล...</span>
      </div>
    )
  }

  // แสดงข้อความเมื่อไม่สามารถเชื่อมต่อกับ API ได้
  if (!apiConnected) {
    return (
      <div className="pt-16 px-6 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">หน้าหลัก</h1>

        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อหรือลองใหม่ภายหลัง</span>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={fetchData}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    )
  }

  // แสดง error state
  if (error) {
    return (
      <div className="md:p-16 p-1 min-h-screen">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    )
  }

  // จัดรูปแบบวันที่
  const formatDate2 = (dateString) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  return (
    <>
      <div className="md:p-16 p-1 min-h-screen">
        <div className="flex flex-wrap md:flex-nowrap space-y-4 md:space-y-0 md:space-x-4">
          {/* Announcement card */}
          <div className="md:col-span-2 p-6 rounded-lg shadow-2xl text-base-content w-full">
            <h1 className="text-4xl font-bold text-base-content mb-8">ประกาศ</h1>
            {/* Announcements List */}
            <div className="overflow-y-scroll h-96 ">
              {announcements.length > 0 ? (
                announcements.map((announcement) => (
                  <div key={announcement.id} className="mb-2 border-l-4 border-red-500 pl-2">
                    <h2 className="text-lg font-semibold">
                      {announcement.title} <span className="text-sm">({formatDate2(announcement.publishDate)})</span>
                    </h2>
                    <p className="text-sm">: {announcement.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">ไม่มีประกาศในขณะนี้</div>
              )}
            </div>
          </div>

          {/* Report card */}
          <div className="card-body shadow-2xl w-7xl rounded-lg">
            <div className="flex items-center rounded-lg">
              <div className="text-4xl font-bold text-base-content mb-6">แจ้งชำระค่าเช่า</div>
            </div>
            <div className="card bg-base-100 card-md shadow-sm">
              <div className="card-body w-full">
                <div className="text-xl">
                  <b>ชื่อ:</b>{" "}
                  {userData?.fullName || 
                   (userData?.user && userData.user.fullName) || 
                   JSON.parse(localStorage.getItem("user") || "{}")?.fullName || 
                   "ไม่พบข้อมูลผู้ใช้"}
                </div>
                <div className="text-lg">
                  <b>เลขห้อง:</b>{" "}
                  {billData?.roomNumber || 
                   userRoomNumber || 
                   localStorage.getItem("roomNumber") || 
                   "ไม่พบข้อมูลห้อง"}
                  {!billData?.roomNumber && !userRoomNumber && !localStorage.getItem("roomNumber") && (
                    <button 
                      onClick={handleSetRoomNumber}
                      className="text-xs text-blue-500 hover:underline ml-2"
                    >
                      (กรอกเลขห้อง)
                    </button>
                  )}
                </div>
                <div className="text-lg">
                  <b>ราคา:</b> {billData?.totalAmount?.toLocaleString() || "0"} บาท
                </div>
                <Link href="/auth/payment" className="link link-hover">
                  ข้อมูลเพิ่มเติม
                </Link>
                <div className="justify-end card-actions">
                  <Link className="btn btn-outline btn-primary" href="/auth/payment">
                    ชำระเงิน
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}