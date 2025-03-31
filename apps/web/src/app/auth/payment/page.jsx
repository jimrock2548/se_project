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



  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  // เพิ่มตัวแปรสำหรับการตรวจสอบ slip
  const [isVerifyingSlip, setIsVerifyingSlip] = useState(false)
  const [slipVerificationResult, setSlipVerificationResult] = useState(null)

  useEffect(() => {
    fetchBillData()
  }, [])

  const fetchBillData = async () => {
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

      // ดึงบิลปัจจุบัน
      const currentBillResponse = await axios.get(`${apiUrl}/api/bills/current`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Current bill data:", currentBillResponse.data)
      setCurrentBill(currentBillResponse.data)

      // ดึงประวัติบิลทั้งหมด
      const allBillsResponse = await axios.get(`${apiUrl}/api/bills`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("All bills data:", allBillsResponse.data)
      setBillHistory(allBillsResponse.data.bills || [])
    } catch (error) {
      console.error("Error fetching bill data:", error)

      if (error.response) {
        if (error.response.status === 404 && error.response.data.error === "No current bill found") {
          // ไม่มีบิลปัจจุบัน ไม่ถือเป็นข้อผิดพลาด
          setCurrentBill(null)
        } else {
          setError(`เกิดข้อผิดพลาด: ${error.response.data.error || error.message}`)
        }
      } else {
        setError(`เกิดข้อผิดพลาด: ${error.message}`)
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

  // เพิ่มฟังก์ชันสำหรับการตรวจสอบ slip ด้วย slipok
  const verifySlipWithSlipOk = async (file) => {
    if (!file) return null

    setIsVerifyingSlip(true)
    setSlipVerificationResult(null)

    try {
      // สร้าง FormData สำหรับอัปโหลดไฟล์ไปยัง slipok API
      const formData = new FormData()
      formData.append("slip", file)

      // ในสถานการณ์จริง คุณจะต้องส่งไปยัง slipok API
      // นี่เป็นเพียงตัวอย่างการจำลองการทำงาน
      // const response = await axios.post('https://api.slipok.com/verify', formData)

      // จำลองการตอบกลับจาก slipok API
      // ในสถานการณ์จริง ข้อมูลนี้จะมาจาก API
      const mockResponse = {
        success: true,
        data: {
          bankName: "KBANK",
          accountName: "บริษัท หอพัก จำกัด",
          amount: currentBill ? currentBill.totalAmount : 0,
          transactionDate: new Date().toISOString(),
          verified: true,
          amountMatched: true,
        },
      }

      console.log("Slip verification result:", mockResponse)
      setSlipVerificationResult(mockResponse.data)

      return mockResponse.data
    } catch (error) {
      console.error("Error verifying slip:", error)
      setSlipVerificationResult({
        verified: false,
        error: error.message,
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

      // สร้าง FormData สำหรับอัปโหลดไฟล์
      const formData = new FormData()
      formData.append("slip", uploadedImage)
      formData.append("billId", currentBill.id)
      formData.append("paymentDate", new Date().toISOString())
      formData.append("amount", currentBill.totalAmount)

      // เพิ่มข้อมูลการตรวจสอบจาก slipok (ถ้ามี)
      if (slipVerificationResult) {
        formData.append("verificationResult", JSON.stringify(slipVerificationResult))
      }

      // ส่งข้อมูลไปยัง API
      const response = await axios.post(`${apiUrl}/api/bills/${currentBill.id}/payment`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      console.log("Payment submitted successfully:", response.data)
      setSuccess("อัปโหลดหลักฐานการชำระเงินสำเร็จ")

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
                        <img
                          src={"/img/QR.jpg"}
                          alt="QR Code สำหรับชำระเงิน"
                          className="w-64 h-64 object-contain"
                        />
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
                              <p>ธนาคาร: {slipVerificationResult.bankName}</p>
                              <p>ชื่อบัญชี: {slipVerificationResult.accountName}</p>
                              <p>จำนวนเงิน: {formatCurrency(slipVerificationResult.amount)}</p>
                              <p>วันที่โอน: {formatDate(slipVerificationResult.transactionDate)}</p>
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
              {billHistory.map((bill) => (
                <div key={bill.id} className="mb-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">บิลเดือน {formatDate(bill.billingPeriodStart)}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(bill.status)}`}>
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
                      {bill.payments.map((payment, index) => (
                        <div key={payment.id || index} className="flex justify-between text-sm">
                          <span>{formatDate(payment.paymentDate)}</span>
                          <span className="font-medium">{formatCurrency(payment.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    className="mt-2 text-sm text-blue-500 hover:text-blue-700"
                    onClick={() => router.push(`/auth/payment/${bill.id}`)}
                  >
                    ดูรายละเอียดเพิ่มเติม
                  </button>
                </div>
              ))}
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

