"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Trash2, AlertCircle, CheckCircle, Clock, RefreshCw, Loader } from "lucide-react"
import axios from "axios"

function LandlordHomePage() {
  const router = useRouter()
  const [announcement, setAnnouncement] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    message: "",
  })

  const [announcements, setAnnouncements] = useState([])
  const [reports, setReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [token, setToken] = useState("")
  const [updatingReportId, setUpdatingReportId] = useState(null)
  const [openedReportId, setOpenedReportId] = useState(null)

  const url = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    // ดึง token จาก localStorage หรือ sessionStorage
    const storedToken =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("authToken") ||
      ""
    setToken(storedToken)
  }, [])

  useEffect(() => {
    fetchData()
  }, [token, url])

  const fetchData = async () => {
    if (!token) return

    setIsLoading(true)
    setError(null)

    try {
      // ดึงข้อมูลประกาศ
      const announcementsResponse = await axios.get(`${url}/api/announcements`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      console.log("Fetched announcements data:", announcementsResponse.data)
      setAnnouncements(announcementsResponse.data.announcements || [])

      // ดึงข้อมูลรายงาน
      const reportsResponse = await axios.get(`${url}/api/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      console.log("Fetched reports data:", reportsResponse.data)

      // แปลงข้อมูลรายงานให้อยู่ในรูปแบบที่ต้องการ
      const formattedReports = reportsResponse.data.reports.map((report) => ({
        id: report.id,
        user: report.reporter?.user?.username || report.reporter?.user?.fullName || "ผู้ใช้",
        room: report.reporter?.room?.roomNumber || "ไม่ระบุ",
        reportedUser: report.reported?.user?.username || report.reported?.user?.fullName || "ไม่ระบุ",
        reportedRoom: report.reported?.room?.roomNumber || "ไม่ระบุ",
        options: report.title,
        description: report.description,
        status: report.status,
        createdAt: new Date(report.createdAt).toLocaleDateString("th-TH"),
      }))

      setReports(formattedReports)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err.message || "เกิดข้อผิดพลาดในการดึงข้อมูล")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnnouncementChange = (e) => {
    const { name, value } = e.target
    setAnnouncement((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAnnouncementSubmit = async () => {
    if (!announcement.title || !announcement.message) {
      alert("กรุณากรอกหัวข้อและข้อความ")
      return
    }

    try {
      if (!token) {
        alert("กรุณาเข้าสู่ระบบก่อน")
        return
      }

      console.log("Token being sent:", token)

      const response = await axios.post(
        `${url}/api/announcements`,
        {
          title: announcement.title,
          content: announcement.message,
          publishDate: new Date(announcement.date).toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      console.log("Response from server:", response.data)

      const data = response.data

      const newAnnouncement = {
        id: data.announcement.id,
        title: data.announcement.title,
        publishDate: data.announcement.publishDate,
        content: data.announcement.content,
        landlord: data.announcement.landlord,
      }

      setAnnouncements([newAnnouncement, ...announcements])

      setAnnouncement({
        title: "",
        date: new Date().toISOString().split("T")[0],
        message: "",
      })

      alert("เพิ่มประกาศสำเร็จ")
    } catch (err) {
      console.error("Error creating announcement:", err.response || err.message)
      alert(`เกิดข้อผิดพลาด: ${err.response?.data?.error || err.message}`)
    }
  }

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("คุณต้องการลบประกาศนี้ใช่หรือไม่?")) {
      return
    }

    try {
      if (!token) {
        alert("กรุณาเข้าสู่ระบบก่อน")
        return
      }

      await axios.delete(`${url}/api/announcements/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setAnnouncements(announcements.filter((item) => item.id !== id))

      alert("ลบประกาศสำเร็จ")
    } catch (err) {
      console.error("Error deleting announcement:", err)
      alert(`เกิดข้อผิดพลาด: ${err.response?.data?.error || err.message}`)
    }
  }

  // เพิ่มฟังก์ชันลบรายงาน
  const handleDeleteReport = async (e, id) => {
    // ป้องกันการปิด collapse
    e.stopPropagation()

    if (!window.confirm("คุณต้องการลบรายงานนี้ใช่หรือไม่?")) {
      return
    }

    try {
      if (!token) {
        alert("กรุณาเข้าสู่ระบบก่อน")
        return
      }

      // ตั้งค่า ID ของรายงานที่กำลังอัปเดต
      setUpdatingReportId(id)

      console.log(`Deleting report ${id}`)

      // ส่งคำขอไปยัง API
      await axios.delete(`${url}/api/reports/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Report deleted successfully")

      // ลบรายงานออกจากรายการ
      setReports(reports.filter((report) => report.id !== id))

      // ปิด collapse ของรายงานที่ถูกลบ
      if (openedReportId === id) {
        setOpenedReportId(null)
      }

      alert("ลบรายงานสำเร็จ")
    } catch (err) {
      console.error("Error deleting report:", err)

      if (err.response) {
        console.error("Error response:", err.response.data)
        console.error("Status code:", err.response.status)
      }

      alert(`เกิดข้อผิดพลาดในการลบรายงาน: ${err.response?.data?.error || err.message}`)
    } finally {
      // ยกเลิกสถานะกำลังอัปเดต
      setUpdatingReportId(null)
    }
  }

  // แก้ไขฟังก์ชัน handleUpdateReportStatus ให้ทำงานได้อย่างถูกต้อง
  const handleUpdateReportStatus = async (e, id, status) => {
    // ป้องกันการปิด collapse
    e.stopPropagation()

    try {
      if (!token) {
        alert("กรุณาเข้าสู่ระบบก่อน")
        return
      }

      // ตั้งค่า ID ของรายงานที่กำลังอัปเดต
      setUpdatingReportId(id)

      console.log(`Updating report ${id} status to ${status}`)

      // ส่งคำขอไปยัง API
      const response = await axios.patch(
        `${url}/api/reports/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      console.log("Status update response:", response.data)

      // อัปเดตสถานะในรายการหลังจากได้รับการยืนยันจาก API
      if (response.data && response.data.report) {
        setReports(
          reports.map((report) => (report.id === id ? { ...report, status: response.data.report.status } : report)),
        )
        console.log("Report status updated successfully")
      } else {
        // ถ้า API ไม่ส่งข้อมูลกลับมา ให้อัปเดตตามค่าที่ส่งไป
        setReports(reports.map((report) => (report.id === id ? { ...report, status } : report)))
      }
    } catch (err) {
      console.error("Error updating report status:", err)

      if (err.response) {
        console.error("Error response:", err.response.data)
        console.error("Status code:", err.response.status)
      }

      alert(`เกิดข้อผิดพลาดในการอัปเดตสถานะ: ${err.response?.data?.error || err.message}`)

      // หากเกิดข้อผิดพลาด ให้เรียกข้อมูลใหม่เพื่อรีเซ็ตสถานะ
      fetchData()
    } finally {
      // ยกเลิกสถานะกำลังอัปเดต
      setUpdatingReportId(null)
    }
  }

  // ฟังก์ชันสำหรับจัดการการเปิด/ปิด collapse
  const handleToggleCollapse = (id) => {
    setOpenedReportId(openedReportId === id ? null : id)
  }

  // แปลงสถานะเป็นภาษาไทย
  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "รอดำเนินการ"
      case "IN_PROGRESS":
      case "INVESTIGATING":
        return "กำลังตรวจสอบ"
      case "RESOLVED":
        return "แก้ไขแล้ว"
      case "REJECTED":
        return "ปฏิเสธ"
      default:
        return status
    }
  }

  // แปลงสถานะเป็น badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "PENDING":
        return "badge-warning"
      case "IN_PROGRESS":
      case "INVESTIGATING":
        return "badge-info"
      case "RESOLVED":
        return "badge-success"
      case "REJECTED":
        return "badge-error"
      default:
        return "badge-ghost"
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen">
        <div className="alert alert-error">
          <AlertCircle className="h-6 w-6" />
          <span>เกิดข้อผิดพลาด: {error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 px-6 min-h-screen">
      <div className="flex flex-wrap md:flex-nowrap space-y-4 md:space-y-0 md:space-x-4">
        {/* ส่วนประกาศ */}
        <div className="md:col-span-2 p-6 rounded-lg shadow-2xl text-base-content w-full">
          <h1 className="text-4xl font-bold text-base-content mb-6">ประกาศ</h1>
          <div className="mb-4 md:flex">
            <fieldset className="fieldset pr-4">
              <legend className="fieldset-legend">หัวข้อ</legend>
              <input
                type="text"
                name="title"
                className="input"
                placeholder="Title here..."
                value={announcement.title}
                onChange={handleAnnouncementChange}
              />
            </fieldset>

            <fieldset className="fieldset pr-4">
              <legend className="fieldset-legend">วันที่</legend>
              <input
                type="date"
                name="date"
                className="input"
                value={announcement.date}
                onChange={handleAnnouncementChange}
              />
            </fieldset>

            <fieldset className="fieldset pr-4">
              <legend className="fieldset-legend">ข้อความ</legend>
              <input
                type="text"
                name="message"
                className="input md:pr-24"
                placeholder="Message here..."
                value={announcement.message}
                onChange={handleAnnouncementChange}
              />
            </fieldset>
          </div>
          <div className="pb-7">
            <button className="btn" onClick={handleAnnouncementSubmit}>
              ตกลง
            </button>
          </div>

          <div className="overflow-y-scroll h-96">
            {Array.isArray(announcements) && announcements.length > 0 ? (
              announcements.map((announcement) => (
                <div key={announcement.id} className="mb-2 border-l-4 border-red-500 pl-2 relative group">
                  <h2 className="text-lg font-semibold">
                    {announcement.title}{" "}
                    <span className="text-sm">({new Date(announcement.publishDate).toLocaleDateString("th-TH")})</span>
                  </h2>
                  <p className="text-sm">: {announcement.content}</p>
                  <button
                    className="absolute right-2 top-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">ไม่มีประกาศในขณะนี้</div>
            )}
          </div>
        </div>

        {/* ส่วนรายงาน */}
        <div className="card-body shadow-2xl w-2xl rounded-lg">
          <div className="flex items-center justify-between rounded-lg mb-4">
            <div className="text-4xl font-bold text-base-content">รายงาน</div>
            <button className="btn btn-sm btn-outline flex items-center" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-1" />
              รีเฟรช
            </button>
          </div>
          <div className="overflow-y-scroll h-96">
            {reports.length === 0 ? (
              <div className="text-center py-4 text-gray-500">ไม่มีรายงานในขณะนี้</div>
            ) : (
              reports.map((report, index) => (
                <div key={report.id || index} className="bg-base-100 border-base-300 border mb-2 rounded-lg">
                  {/* ส่วนหัวของรายงาน - คลิกเพื่อเปิด/ปิด */}
                  <div
                    className="p-4 font-semibold flex items-center cursor-pointer"
                    onClick={() => handleToggleCollapse(report.id)}
                  >
                    <span>
                      ห้อง {report.room} ({report.user})
                    </span>
                    <div className="ml-auto flex items-center">
                      <span className={`badge ${getStatusBadgeClass(report.status)} mr-2`}>
                        {getStatusText(report.status)}
                      </span>
                      <div className="transform transition-transform duration-200">
                        {openedReportId === report.id ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="feather feather-chevron-up"
                          >
                            <polyline points="18 15 12 9 6 15"></polyline>
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="feather feather-chevron-down"
                          >
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ส่วนเนื้อหาของรายงาน - แสดงเมื่อเปิด */}
                  {openedReportId === report.id && (
                    <div className="p-4 pt-0 text-sm border-t">
                      <p>
                        <strong>หัวข้อ:</strong> {report.options}
                      </p>
                      <p>
                        <strong>รายงานเกี่ยวกับ:</strong> {report.reportedUser} (ห้อง {report.reportedRoom})
                      </p>
                      <p>
                        <strong>รายละเอียด:</strong> {report.description}
                      </p>
                      <p>
                        <strong>วันที่รายงาน:</strong> {report.createdAt}
                      </p>

                      <div className="flex justify-end mt-2 space-x-2">
                        {report.status !== "PENDING" && (
                          <button
                            className="btn btn-xs btn-warning"
                            onClick={(e) => handleUpdateReportStatus(e, report.id, "PENDING")}
                            disabled={updatingReportId === report.id}
                          >
                            {updatingReportId === report.id ? (
                              <Loader className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <Clock className="h-3 w-3 mr-1" />
                            )}{" "}
                            รอดำเนินการ
                          </button>
                        )}
                        {report.status !== "RESOLVED" && (
                          <button
                            className="btn btn-xs btn-success"
                            onClick={(e) => handleUpdateReportStatus(e, report.id, "RESOLVED")}
                            disabled={updatingReportId === report.id}
                          >
                            {updatingReportId === report.id ? (
                              <Loader className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            )}{" "}
                            แก้ไขแล้ว
                          </button>
                        )}
                        <button
                          className="btn btn-xs btn-error"
                          onClick={(e) => handleDeleteReport(e, report.id)}
                          disabled={updatingReportId === report.id}
                        >
                          {updatingReportId === report.id ? (
                            <Loader className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3 mr-1" />
                          )}{" "}
                          ลบรายงาน
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandlordHomePage

