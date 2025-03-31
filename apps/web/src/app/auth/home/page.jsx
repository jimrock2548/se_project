"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const [announcements, setAnnouncements] = useState([])
  const [userData, setUserData] = useState(null)
  const [billData, setBillData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const token = sessionStorage.getItem("authToken") || localStorage.getItem("authToken")

        if (!token) {
          setError("กรุณาเข้าสู่ระบบก่อน")
          setIsLoading(false)
          return
        }

        // ดึงข้อมูลประกาศ
        const announcementsResponse = await fetch(`${apiUrl}/api/announcements`)
        const announcementsData = await announcementsResponse.json()

        // ดึงข้อมูลผู้ใช้
        const userResponse = await fetch(`${apiUrl}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const userData = await userResponse.json()

        // ดึงข้อมูลบิลค่าเช่า (ถ้ามี API endpoint)
        let billData = null
        try {
          const billResponse = await fetch(`${apiUrl}/api/bills/current`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (billResponse.ok) {
            billData = await billResponse.json()
          }
        } catch (billError) {
          console.warn("ไม่สามารถดึงข้อมูลบิลได้:", billError)
          // ใช้ข้อมูลจำลองสำหรับบิล
          billData = {
            roomNumber: userData.user?.resident?.room?.roomNumber || "123",
            residentName: userData.user?.fullName || "นาย จุฑาวัชร บุษษะ",
            totalAmount: 4650,
            dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
          }
        }

        // เก็บข้อมูลที่ได้ใน state
        setAnnouncements(announcementsData.announcements || [])
        setUserData(userData.user)
        setBillData(billData)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล")

        // ใช้ข้อมูลจำลองในกรณีที่ API มีปัญหา
        setAnnouncements([
          { id: "1", title: "Merry Christmas", publishDate: "2024-12-06", content: "มีขนมแจกฟรีที่ lobby ช่วยกินหน่อย" },
          { id: "2", title: "ไฟชั้น 2 เสีย", publishDate: "2024-02-07", content: "กลับไปอยู่ห้องนะ ช่างกำลังจะมา" },
          { id: "3", title: "แจ้งซ่อมน้ำรั่ว", publishDate: "2024-03-15", content: "ช่างจะมาซ่อมน้ำรั่วในวันพรุ่งนี้ เวลา 10.00 น." },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [apiUrl])

  // แสดง loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-2 text-lg">กำลังโหลดข้อมูล...</span>
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
  const formatDate = (dateString) => {
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
                      {announcement.title} <span className="text-sm">({formatDate(announcement.publishDate)})</span>
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
                  <b>ชื่อ:</b> {userData?.fullName || "ไม่พบข้อมูลผู้ใช้"}
                </div>
                <div className="text-lg">
                  <b>เลขห้อง:</b> {userData?.resident?.room?.roomNumber || billData?.roomNumber || "ไม่พบข้อมูลห้อง"}
                </div>
                <div className="text-lg">
                  <b>ราคารวม:</b> {billData?.totalAmount?.toLocaleString() || "4,650"} บาท
                </div>
                <p className="text-red-500">
                  ****โปรดชำระเงินภายในวันที่ 5 ของเดือนถัดไป เวลา 21:00 น. ล่าช้าปรับครั้งละ 50 บาท****
                </p>
                <Link href="/auth/payment" className="link link-hover">
                  ข้อมูลเพิ่มเติม
                </Link>
                <div className="justify-end card-actions">
                  <Link className="btn btn-outline btn-primary" href="/auth/choose_payment">
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

