"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { AlertCircle, FileText, Upload, CheckCircle, Clock, Calendar, CreditCard } from "lucide-react"

export default function PaymentPage() {
  const [currentBill, setCurrentBill] = useState(null)
  const [billHistory, setBillHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)
  const router = useRouter()

  // เพิ่มตัวแปรสำหรับ QR Code
  const [qrCodeUrl, setQrCodeUrl] = useState(
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/QR.jpg-oAZhBnSGdzbrI1xySb1fScNC5Y5Os8.jpeg",
  )

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  // เพิ่มตัวแปรสำหรับการตรวจสอบ slip
  const [isVerifyingSlip, setIsVerifyingSlip] = useState(false)
  const [slipVerificationResult, setSlipVerificationResult] = useState(null)

  // เพิ่มตัวแปรสำหรับตรวจสอบการเชื่อมต่อ API
  const [apiConnected, setApiConnected] = useState(true)

  // แก้ไขส่วนของการแสดงรูปภาพสลิปในหน้าประวัติการชำระเงิน
  // เพิ่มฟังก์ชันนี้ในส่วนต้นของ component
  const [localSlipImages, setLocalSlipImages] = useState({})

  // ฟังก์ชันเปิดรูปภาพแบบเต็มหน้าจอ
  const openFullScreenImage = (imageUrl) => {
    window.open(imageUrl, "_blank", "noopener,noreferrer")
  }

  // แก้ไขส่วนของการแสดงบิลปัจจุบัน
  useEffect(() => {
    // โหลดรูปภาพสลิปจาก localStorage
    const savedImages = JSON.parse(localStorage.getItem("slipImages") || "{}")
    setLocalSlipImages(savedImages)

    fetchBillData()
  }, [])

  const fetchBillData = async () => {
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

        // เก็บบิลทั้งหมดไว้ใช้ในส่วนประวัติการชำระเงิน
        setBillHistory(allBillsResponse.data.bills || [])
      } catch (error) {
        console.error("Error fetching bills:", error)
        setBillHistory([])
        setCurrentBill(null)

        // ถ้าเป็นข้อผิดพลาดเกี่ยวกับการเชื่อมต่อ ให้แสดงข้อความ
        if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
          setApiConnected(false)
        }
      }

      // ลบส่วนนี้ออก เพราะเราไม่ต้องเรียก API endpoint `/api/bills/current` อีกต่อไป
      // try {
      //   console.log("Fetching current bill from:", `${apiUrl}/api/bills/current`)
      //   const currentBillResponse = await axios.get(`${apiUrl}/api/bills/current`, {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   })
      //
      //   console.log("Current bill data:", currentBillResponse.data)
      //   setCurrentBill(currentBillResponse.data)
      // } catch (error) {
      //   ...
      // }

      // ลบส่วนนี้ออก เพราะเราได้ดึงข้อมูลบิลทั้งหมดมาแล้ว
      // try {
      //   console.log("Fetching bill history from:", `${apiUrl}/api/bills`)
      //   const allBillsResponse = await axios.get(`${apiUrl}/api/bills`, {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   })
      //
      //   console.log("All bills data:", allBillsResponse.data)
      //   setBillHistory(allBillsResponse.data.bills || [])
      // } catch (error) {
      //   ...
      // }
    } catch (error) {
      console.error("Error in fetchBillData:", error)

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

  // แก้ไขฟังก์ชันสำหรับการตรวจสอบ slip ด้วย slipok ผ่าน API ของเราเอง
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
      // เปลี่ยนชื่อพารามิเตอร์เป็น "file" ตามที่ API ของเราต้องการ
      formData.append("file", file)

      // ทดสอบเรียก API ทดสอบก่อน
      try {
        const testResponse = await axios.get(`${apiUrl}/api/slip/test`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        console.log("Test API response:", testResponse.data)
      } catch (testError) {
        console.error("Test API failed:", testError)
      }

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

  // แก้ไขฟังก์ชัน handleFileChange เพื่อเพิ่มการตรวจสอบ slip
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

  // แก้ไขฟังก์ชัน handleUploadSlip เพื่อใช้ผลการตรวจสอบจาก slipok
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
      fetchBillData()
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

  if (isLoading) {
    return (
      <div className="pt-16 px-6 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // แสดงข้อความเมื่อไม่สามารถเชื่อมต่อกับ API ได้
  if (!apiConnected) {
    return (
      <div className="pt-16 px-6 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">บิลค่าเช่าและการชำระเงิน</h1>

        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อหรือลองใหม่ภายหลัง</span>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={fetchBillData}
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

  return (
    <div className="pt-16 px-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">บิลค่าเช่าและการชำระเงิน</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* บิลปัจจุบัน */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            บิลค่าเช่าปัจจุบัน
          </h2>

          {currentBill ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">สถานะ:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(currentBill.status)}`}
                >
                  {getStatusText(currentBill.status)}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">ห้อง:</span>
                  <span className="font-medium">{currentBill.resident?.room?.roomNumber || "-"}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">ยอดรวม:</span>
                  <span className="font-medium text-lg">{formatCurrency(currentBill.totalAmount)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">วันที่ออกบิล:</span>
                  <span className="font-medium">{formatDate(currentBill.createdAt)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">กำหนดชำระ:</span>
                  <span className="font-medium">{formatDate(currentBill.dueDate)}</span>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-medium mb-2">รายละเอียดค่าใช้จ่าย:</h3>
                <div className="bg-gray-50 p-3 rounded">
                  {currentBill.billItems && currentBill.billItems.length > 0 ? (
                    currentBill.billItems.map((item, index) => (
                      <div key={item.id || index} className="flex justify-between py-1">
                        <span>{item.description}</span>
                        <span>{formatCurrency(item.amount)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center">ไม่มีรายละเอียดค่าใช้จ่าย</p>
                  )}
                </div>
              </div>

              {/* QR Code สำหรับการสแกนจ่าย */}
              {(currentBill.status === "PENDING" || currentBill.status === "OVERDUE") && (
                <div className="mt-6 mb-6 border rounded-lg overflow-hidden shadow-md">
                  {/* ส่วนหัว */}
                  <div className="bg-[#1a4e79] text-white p-3 flex items-center justify-center">
                    <div className="w-7 h-7 mr-2 relative">
                      <div className="absolute inset-0 bg-white rounded-md"></div>
                      <div className="absolute inset-1 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-[#1a4e79] rounded-md flex items-center justify-center">
                          <div className="w-2 h-2 bg-[#4db6ac]"></div>
                        </div>
                      </div>
                    </div>
                    <span className="text-lg font-bold">THAI QR PAYMENT</span>
                  </div>

                  {/* ส่วนเนื้อหา */}
                  <div className="bg-white p-4">
                    {/* โลโก้ PromptPay */}
                    <div className="flex justify-center mb-3">
                      <div className="border border-gray-200 px-4 py-2 rounded">
                        <div className="flex items-center">
                          <div className="bg-[#1a4e79] text-white px-2 py-1 rounded-l font-bold text-sm">Prompt</div>
                          <div className="bg-white text-[#1a4e79] px-2 py-1 border-y border-r border-[#1a4e79] rounded-r font-bold text-sm">
                            Pay
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-center mb-4">
                      <div className="p-2 border border-gray-200 rounded bg-white">
                        <img src="/img/QR.jpg" alt="QR Code สำหรับชำระเงิน" className="w-64 h-64 object-contain" />
                      </div>
                    </div>

                    {/* ข้อมูลบัญชี */}
                    <div className="text-center mb-4">
                      <p className="text-[#4db6ac] text-lg font-medium">สแกน QR เพื่อโอนเข้าบัญชี</p>
                      <p className="font-medium">ชื่อ: ด.ช. ศรสรัน พลแสน</p>
                      <p className="text-gray-700">บัญชี: xxx-x-x2738-x</p>
                      <p className="text-gray-500 text-sm">เลขที่อ้างอิง: 00499907307693</p>
                    </div>

                    {/* ยอดเงินและคำแนะนำ */}
                    <div className="text-center mb-3">
                      <p className="font-bold text-xl">{formatCurrency(currentBill.totalAmount)}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        กรุณาระบุเลขห้อง {currentBill.resident?.room?.roomNumber || "-"} ในรายละเอียดการโอน
                      </p>
                    </div>

                    {/* ส่วนท้าย */}
                    <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-center">
                      <div className="flex items-center">
                        <div className="text-[#4db6ac] font-bold text-2xl mr-2">K+</div>
                        <div className="text-gray-500 text-sm">Accepts all banks | รับเงินได้จากทุกธนาคาร</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(currentBill.status === "PENDING" || currentBill.status === "OVERDUE") && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    อัปโหลดหลักฐานการชำระเงิน:
                  </h3>
                  <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      ref={fileInputRef}
                    />

                    {previewUrl ? (
                      <div className="mb-3">
                        <img
                          src={previewUrl || "/placeholder.svg"}
                          alt="Preview"
                          className="max-h-48 mx-auto rounded"
                        />
                      </div>
                    ) : (
                      <div
                        className="py-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">คลิกเพื่อเลือกรูปภาพ</p>
                        <p className="text-xs text-gray-400 mt-1">รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB</p>
                      </div>
                    )}

                    {/* แสดงผลการตรวจสอบ slip */}
                    {isVerifyingSlip && (
                      <div className="mt-3 p-3 bg-blue-50 rounded">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                          <span className="text-sm text-blue-600">กำลังตรวจสอบสลิป...</span>
                        </div>
                      </div>
                    )}

                    {slipVerificationResult && (
                      <div
                        className={`mt-3 p-3 rounded ${slipVerificationResult.verified ? "bg-green-50" : "bg-red-50"}`}
                      >
                        {slipVerificationResult.verified ? (
                          <div>
                            <div className="flex items-center mb-1">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm font-medium text-green-700">ตรวจสอบสลิปสำเร็จ</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              <p>ธนาคารผู้โอน: {slipVerificationResult.bankName}</p>
                              <p>ธนาคารผู้รับ: {slipVerificationResult.receivingBank}</p>
                              <p>จำนวนเงิน: {formatCurrency(slipVerificationResult.amount)}</p>
                              <p>วันที่โอน: {formatDate(slipVerificationResult.transactionDate)}</p>
                              <p>เลขอ้างอิง: {slipVerificationResult.transRef}</p>
                              {slipVerificationResult.amountMatched ? (
                                <p className="text-green-600 font-medium">✓ จำนวนเงินถูกต้อง</p>
                              ) : (
                                <p className="text-red-600 font-medium">✗ จำนวนเงินไม่ตรงกับยอดที่ต้องชำระ</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                            <span className="text-sm text-red-700">
                              {slipVerificationResult.error || "ไม่สามารถตรวจสอบสลิปได้ กรุณาลองใหม่อีกครั้ง"}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex mt-3">
                      <button
                        className="btn-secondary flex-1 mr-2 py-2 px-4 rounded bg-gray-200 hover:bg-gray-300"
                        onClick={() => {
                          setPreviewUrl(null)
                          setUploadedImage(null)
                          setSlipVerificationResult(null)
                          if (fileInputRef.current) fileInputRef.current.value = ""
                        }}
                        disabled={!previewUrl || isUploading || isVerifyingSlip}
                      >
                        ยกเลิก
                      </button>
                      <button
                        className="btn-primary flex-1 py-2 px-4 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                        onClick={handleUploadSlip}
                        disabled={
                          !uploadedImage ||
                          isUploading ||
                          isVerifyingSlip ||
                          (slipVerificationResult && !slipVerificationResult.verified)
                        }
                      >
                        {isUploading ? "กำลังอัปโหลด..." : "อัปโหลด"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">ไม่มีบิลที่ต้องชำระในขณะนี้</p>
            </div>
          )}
        </div>

        {/* ประวัติการชำระเงิน */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            ประวัติการชำระเงิน
          </h2>

          {billHistory && billHistory.length > 0 ? (
            <div className="overflow-y-auto max-h-[600px]">
              {/* กรองข้อมูลซ้ำโดยใช้ Set เพื่อเก็บ ID ที่แสดงไปแล้ว */}
              {(() => {
                const displayedBills = new Set()
                return billHistory
                  .filter((bill) => {
                    // ตรวจสอบว่าบิลนี้เคยแสดงแล้วหรือไม่
                    if (displayedBills.has(bill.id)) {
                      return false
                    }
                    displayedBills.add(bill.id)
                    return true
                  })
                  .map((bill) => {
                    const dataroom = bill
                    return (
                      <div key={bill.id} className="mb-4 p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">บิลเดือน {formatDate(bill.billingPeriodStart)}</span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(bill.status)}`}
                          >
                            {getStatusText(bill.status)}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">ยอดรวม:</span>
                          <span className="font-medium">{formatCurrency(bill.totalAmount)}</span>
                        </div>

                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">กำหนดชำระ:</span>
                          <span>{formatDate(bill.dueDate)}</span>
                        </div>

                        {bill.payments && bill.payments.length > 0 && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-sm text-gray-600 mb-1">การชำระเงิน:</p>
                            {/* กรองข้อมูลการชำระเงินซ้ำโดยใช้ Set เพื่อเก็บ ID ที่แสดงไปแล้ว */}
                            {(() => {
                              const displayedPayments = new Set()
                              return bill.payments
                                .filter((payment) => {
                                  // ตรวจสอบว่าการชำระเงินนี้เคยแสดงแล้วหรือไม่
                                  if (!payment.id || displayedPayments.has(payment.id)) {
                                    return false
                                  }
                                  displayedPayments.add(payment.id)
                                  return true
                                })
                                .map((payment, index) => (
                                  <div key={payment.id || index} className="flex justify-between text-sm">
                                    <span>{formatDate(payment.paymentDate)}</span>
                                    <span className="font-medium">{formatCurrency(payment.amount)}</span>
                                  </div>
                                ))
                            })()}
                          </div>
                        )}

                        {dataroom.slip ? (
                          <div className="mt-2">
                            <p className="mb-1">หลักฐานการชำระเงิน:</p>
                            {localSlipImages[dataroom.id] ? (
                              <img
                                src={localSlipImages[dataroom.id] || "/placeholder.svg"}
                                alt="ใบเสร็จ"
                                className="w-64 h-auto rounded-lg mt-2 cursor-pointer"
                                onClick={() => openFullScreenImage(localSlipImages[dataroom.id])}
                              />
                            ) : (
                              <img
                                src={dataroom.slip || "/placeholder.svg"}
                                alt="ใบเสร็จ"
                                className="w-64 h-auto rounded-lg mt-2"
                              />
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 mt-2">ไม่มีภาพใบเสร็จ</p>
                        )}

                        <button
                          className="mt-2 text-sm text-blue-500 hover:text-blue-700"
                          onClick={() => router.push(`/auth/payment/${bill.id}`)}
                        >
                          ดูรายละเอียดเพิ่มเติม
                        </button>
                      </div>
                    )
                  })
              })()}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">ไม่มีประวัติการชำระเงิน</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

