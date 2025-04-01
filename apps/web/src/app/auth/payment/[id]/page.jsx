"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { AlertCircle, FileText, ArrowLeft, Calendar, DollarSign, Clock, CheckCircle } from "lucide-react"
import { use } from "react" // เพิ่ม import use จาก React

export default function BillDetailPage({ params }) {
  // ใช้ React.use() เพื่อ unwrap params
  const billId = use(params).id
  const [bill, setBill] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  useEffect(() => {
    if (!billId) return

    const fetchBillDetail = async () => {
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

        const response = await axios.get(`${apiUrl}/api/bills/${billId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        console.log("Bill detail:", response.data)
        setBill(response.data.bill)
      } catch (error) {
        console.error("Error fetching bill detail:", error)

        if (error.response) {
          setError(`เกิดข้อผิดพลาด: ${error.response.data.error || error.message}`)
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

    fetchBillDetail()
  }, [billId, router, apiUrl])

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

  if (error) {
    return (
      <div className="pt-16 px-6 min-h-screen">
        <button className="mb-4 flex items-center text-blue-500 hover:text-blue-700" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          ย้อนกลับ
        </button>

        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  if (!bill) {
    return (
      <div className="pt-16 px-6 min-h-screen">
        <button className="mb-4 flex items-center text-blue-500 hover:text-blue-700" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          ย้อนกลับ
        </button>

        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">ไม่พบข้อมูลบิล</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 px-6 min-h-screen">
      <button className="mb-4 flex items-center text-blue-500 hover:text-blue-700" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-1" />
        ย้อนกลับ
      </button>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">รายละเอียดบิล</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(bill.status)}`}>
            {getStatusText(bill.status)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              ข้อมูลบิล
            </h2>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">เลขที่บิล:</span>
                <span className="font-medium">{bill.id.substring(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ห้อง:</span>
                <span className="font-medium">{bill.resident?.room?.roomNumber || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ผู้เช่า:</span>
                <span className="font-medium">{bill.resident?.user?.fullName || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">วันที่ออกบิล:</span>
                <span>{formatDate(bill.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">รอบบิล:</span>
                <span>
                  {formatDate(bill.billingPeriodStart)} - {formatDate(bill.billingPeriodEnd)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">กำหนดชำระ:</span>
                <span className={bill.status === "OVERDUE" ? "text-red-600 font-medium" : ""}>
                  {formatDate(bill.dueDate)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              ยอดชำระ
            </h2>

            <div className="space-y-2">
              <div className="flex justify-between text-xl font-bold">
                <span>ยอดรวม:</span>
                <span>{formatCurrency(bill.totalAmount)}</span>
              </div>

              {bill.status === "PAID" && (
                <div className="flex justify-between text-green-600">
                  <span>ชำระแล้ว:</span>
                  <span>{formatCurrency(bill.totalAmount)}</span>
                </div>
              )}

              {bill.status === "PENDING" && (
                <div className="flex justify-between text-yellow-600">
                  <span>ยอดค้างชำระ:</span>
                  <span>{formatCurrency(bill.totalAmount)}</span>
                </div>
              )}

              {bill.status === "OVERDUE" && (
                <div className="flex justify-between text-red-600">
                  <span>ยอดค้างชำระ (เกินกำหนด):</span>
                  <span>{formatCurrency(bill.totalAmount)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            ใบเสร็จรับเงิน
          </h2>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            {/* Header */}
            <div className="border-b pb-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold">ใบเสร็จรับเงิน</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(bill.status)}`}>
                  {getStatusText(bill.status)}
                </div>
              </div>
              <p className="text-gray-500 text-sm">เลขที่: {bill.id.substring(0, 8).toUpperCase()}</p>
            </div>

            {/* Billing Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-500 text-sm mb-1">ผู้เช่า</p>
                <p className="font-medium">{bill.resident?.user?.fullName || "-"}</p>
                <p className="text-sm">ห้อง {bill.resident?.room?.roomNumber || "-"}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-sm mb-1">วันที่ออกใบเสร็จ</p>
                <p className="font-medium">{formatDate(bill.createdAt)}</p>
                <p className="text-sm">
                  รอบบิล: {formatDate(bill.billingPeriodStart)} - {formatDate(bill.billingPeriodEnd)}
                </p>
              </div>
            </div>

            {/* Bill Items - แสดงเฉพาะยอดรวม */}
            <div className="border-t border-b py-4 mb-4 text-center">
              <p className="text-gray-500 mb-2">ไม่มีรายละเอียดค่าใช้จ่าย</p>
              <p className="text-xl font-bold">{formatCurrency(bill.totalAmount)}</p>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center text-lg font-bold mb-6">
              <span>ยอดรวมทั้งสิ้น</span>
              <span>{formatCurrency(bill.totalAmount)}</span>
            </div>

            {/* Payment Info */}
            {bill.payments && bill.payments.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  ข้อมูลการชำระเงิน
                </h4>
                {bill.payments.map((payment, index) => (
                  <div key={payment.id || index} className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">วันที่ชำระ:</span>
                      <span>{formatDate(payment.paymentDate)}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">จำนวนเงิน:</span>
                      <span className="font-medium">{formatCurrency(payment.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">วิธีการชำระ:</span>
                      <span>{payment.paymentMethod?.name || "โอนเงินผ่านธนาคาร"}</span>
                    </div>
                    {payment.transactionId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">เลขที่อ้างอิง:</span>
                        <span>{payment.transactionId}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>ขอบคุณสำหรับการชำระเงิน</p>
              <p>หากมีข้อสงสัยกรุณาติดต่อผู้ดูแลหอพัก</p>
            </div>
          </div>
        </div>

        {bill.payments && bill.payments.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              ประวัติการชำระเงิน
            </h2>

            <div className="bg-gray-50 p-4 rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">วันที่ชำระ</th>
                    <th className="text-right py-2">จำนวนเงิน</th>
                    <th className="text-left py-2">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.payments.map((payment, index) => (
                    <tr key={payment.id || index} className="border-b">
                      <td className="py-2">{formatDate(payment.paymentDate)}</td>
                      <td className="text-right py-2">{formatCurrency(payment.amount)}</td>
                      <td className="py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === "CONFIRMED"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {payment.status === "CONFIRMED"
                            ? "ยืนยันแล้ว"
                            : payment.status === "PENDING"
                              ? "รอตรวจสอบ"
                              : payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

