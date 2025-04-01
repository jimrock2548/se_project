"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { Loader2 } from "lucide-react"

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

  // เพิ่มตัวแปรสำหรับการตรวจสอบ slip
  const [isVerifyingSlip, setIsVerifyingSlip] = useState(false)
  const [slipVerificationResult, setSlipVerificationResult] = useState(null)

  // เพิ่มตัวแปรสำหรับตรวจสอบการเชื่อมต่อ API
  const [apiConnected, setApiConnected] = useState(true)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

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

      // ดึงข้อมูลผู้ใช้
      try {
        // ดึงข้อมูลผู้ใช้จาก localStorage
        const userDataFromStorage = JSON.parse(localStorage.getItem("user") || "{}")
        console.log("User data from localStorage:", userDataFromStorage)
        setUserData(userDataFromStorage)
      } catch (userError) {
        console.error("Error parsing user data from localStorage:", userError)
        setUserData({})
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

  // ฟังก์ชันสำหรับการตรวจสอบ slip ด้วย slipok ผ่าน API
  const verifySlipWithSlipOk = async (file) => {
    if (!file) return null

    setIsVerifyingSlip(true)
    setSlipVerificationResult(null)

    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken")

      if (!token) {
        throw new Error("กรุณาเข้าสู่ระบบก่อน")
      }

      console.log("Verifying slip with file:", file.name, "size:", file.size)

      // สร้าง FormData สำหรับอัปโหลดไฟล์ไปยัง API ของเรา
      const formData = new FormData()
      formData.append("file", file)

      console.log("Sending request to:", `${apiUrl}/api/slip/verify`)

      // เรียกใช้ API ของเราที่จะส่งต่อไปยัง SlipOK
      const response = await axios.post(`${apiUrl}/api/slip/verify`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      console.log("Slip verification result:", response.data)

      // ตรวจสอบว่าการตอบกลับถูกต้อง
      if (response.data && response.data.success) {
        // แปลงข้อมูลจาก SlipOK API ให้เข้ากับรูปแบบที่ใช้ในแอปพลิเคชัน
        const verificationResult = {
          verified: true,
          bankName: response.data.data.sendingBank || "ไม่ระบุ",
          accountName: response.data.data.sender?.displayName || response.data.data.sender?.name || "ไม่ระบุ",
          amount: Number.parseFloat(response.data.data.amount) || 0,
          transactionDate:
            response.data.data.transTimestamp || response.data.data.transDate || new Date().toISOString(),
          transRef: response.data.data.transRef || "",
          receivingBank: response.data.data.receivingBank || "",
          amountMatched: currentBill
            ? Math.abs(Number.parseFloat(response.data.data.amount) - currentBill.totalAmount) < 0.01
            : false,
        }

        setSlipVerificationResult(verificationResult)
        return verificationResult
      } else {
        // กรณีที่ API ตอบกลับว่าไม่สำเร็จ
        console.warn("API returned success=false:", response.data)
        setSlipVerificationResult({
          verified: false,
          error: response.data.message || "ไม่สามารถตรวจสอบสลิปได้",
        })
        return null
      }
    } catch (error) {
      console.error("Error verifying slip:", error)

      if (error.response) {
        console.error("Error response status:", error.response.status)
        console.error("Error response data:", error.response.data)
      }

      setSlipVerificationResult({
        verified: false,
        error: error.message || "เกิดข้อผิดพลาดในการตรวจสอบสลิป",
      })
      return null
    } finally {
      setIsVerifyingSlip(false)
    }
  }

  // ฟังก์ชันสำหรับการเลือกไฟล์
  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // ตรวจสอบประเภทไฟล์
    if (!file.type.includes("image/")) {
      setError("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น")
      return
    }

    // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("ขนาดไฟล์ต้องไม่เกิน 5MB")
      return
    }

    setUploadedImage(file)
    setPreviewUrl(URL.createObjectURL(file))
    setError(null)

    // ตรวจสอบ slip ด้วย slipok
    await verifySlipWithSlipOk(file)
  }

  // ฟังก์ชันสำหรับการอัปโหลดสลิป
  const handleUploadSlip = async () => {
    if (!uploadedImage) {
      setError("กรุณาเลือกไฟล์รูปภาพก่อน")
      return
    }

    if (!currentBill || !currentBill.id) {
      setError("ไม่พบข้อมูลบิลที่ต้องชำระ")
      return
    }

    setIsUploading(true)
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

      // ตรวจสอบสลิปก่อนถ้ายังไม่ได้ตรวจสอบ
      let verificationData = slipVerificationResult
      if (!verificationData) {
        verificationData = await verifySlipWithSlipOk(uploadedImage)
      }

      // สร้าง FormData สำหรับอัปโหลดไฟล์
      const formData = new FormData()
      formData.append("slip", uploadedImage)
      formData.append("billId", currentBill.id)
      formData.append("paymentDate", new Date().toISOString())
      formData.append("amount", currentBill.totalAmount)

      // เพิ่มการส่ง transaction ID ไปด้วย
      if (verificationData && verificationData.verified && verificationData.transRef) {
        formData.append("transactionId", verificationData.transRef)
      }

      // เพิ่มสถานะการชำระเงิน
      if (verificationData && verificationData.verified && verificationData.amountMatched) {
        formData.append("status", "COMPLETED")
      } else {
        formData.append("status", "PENDING")
      }

      // เพิ่มข้อมูลการตรวจสอบสลิปทั้งหมด
      if (verificationData && verificationData.verified) {
        formData.append("verificationResult", JSON.stringify(verificationData))
      }

      console.log("Sending payment data to:", `${apiUrl}/api/bills/${currentBill.id}/payment`)

      // ส่งข้อมูลไปยัง API
      const response = await axios.post(`${apiUrl}/api/bills/${currentBill.id}/payment`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      console.log("Payment submitted successfully:", response.data)

      // แสดงข้อความตามผลการตรวจสอบ
      if (verificationData && verificationData.verified && verificationData.amountMatched) {
        setSuccess("อัปโหลดหลักฐานการชำระเงินสำเร็จ และตรวจสอบแล้วว่าถูกต้อง")
      } else if (verificationData && verificationData.verified) {
        setSuccess("อัปโหลดหลักฐานการชำระเงินสำเร็จ แต่จำนวนเงินไม่ตรงกับยอดที่ต้องชำระ")
      } else {
        setSuccess("อัปโหลดหลักฐานการชำระเงินสำเร็จ รอการตรวจสอบจากผู้ดูแลระบบ")
      }

      // รีเซ็ตฟอร์ม
      setUploadedImage(null)
      setPreviewUrl(null)
      setSlipVerificationResult(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // ดึงข้อมูลใหม่
      fetchData()
    } catch (error) {
      console.error("Error uploading payment slip:", error)

      if (error.response) {
        console.error("Error response:", error.response.data)
        setError(`เกิดข้อผิดพลาด: ${error.response.data.error || error.message}`)
      } else {
        setError(`เกิดข้อผิดพลาด: ${error.message}`)
      }
    } finally {
      setIsUploading(false)
    }
  }

  // แปลงสถานะเป็นภาษาไทย
  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "รอชำระเงิน"
      case "PAID":
        return "ชำระแล้ว"
      case "OVERDUE":
        return "เกินกำหนดชำระ"
      case "PROCESSING":
        return "กำลังตรวจสอบ"
      default:
        return status
    }
  }

  // แปลงสถานะเป็น badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "PAID":
        return "bg-green-100 text-green-800"
      case "OVERDUE":
        return "bg-red-100 text-red-800"
      case "PROCESSING":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
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
    router.push("/")
  }

  // แปลงสถานะเป็นภาษาไทย
  const getStatusText2 = (status) => {
    switch (status) {
      case "PENDING":
        return "รอชำระเงิน"
      case "PAID":
        return "ชำระแล้ว"
      case "OVERDUE":
        return "เกินกำหนดชำระ"
      case "PROCESSING":
        return "กำลังตรวจสอบ"
      default:
        return "ไม่ทราบสถานะ"
    }
  }

  // กำหนดสีของ badge ตามสถานะ
  const getBadgeClass = (status) => {
    switch (status) {
      case "PENDING":
        return "badge-warning"
      case "PAID":
        return "badge-success"
      case "OVERDUE":
        return "badge-error"
      case "PROCESSING":
        return "badge-info"
      default:
        return "badge-ghost"
    }
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
                  {userData?.fullName || JSON.parse(localStorage.getItem("user") || "{}")?.fullName || "ไม่พบข้อมูลผู้ใช้"}
                </div>
                <div className="text-lg">
                  <b>เลขห้อง:</b>{" "}
                  {billData?.roomNumber ||
                    JSON.parse(localStorage.getItem("user") || "{}")?.roomNumber ||
                    "ไม่พบข้อมูลห้อง"}
                </div>
                <div className="text-lg">
                  <b>ราคารวม:</b> {billData?.totalAmount?.toLocaleString() || "0"} บาท
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

