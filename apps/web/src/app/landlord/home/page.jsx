"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Trash2, AlertCircle, CheckCircle, Clock } from "lucide-react"
import axios from "axios"
import { getCookie } from "cookies-next/client"

function Page() {
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

  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  useEffect(() => {
    // ดึง token จาก cookie หรือ sessionStorage หรือ localStorage
    const storedToken =
      getCookie("access_token") || sessionStorage.getItem("authToken") || localStorage.getItem("authToken") || ""
    setToken(storedToken)
  }, [])

  useEffect(() => {
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
          user: report.reporter?.user?.username || "ผู้ใช้",
          room: report.reporter?.room?.roomNumber || "ไม่ระบุ",
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

    fetchData()
  }, [token, url])

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

  const handleUpdateReportStatus = async (id, status) => {
    try {
      if (!token) {
        alert("กรุณาเข้าสู่ระบบก่อน")
        return
      }

      const response = await axios.patch(
        `${url}/api/reports/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // อัปเดตสถานะรายงานในรายการ
      setReports(reports.map((report) => (report.id === id ? { ...report, status } : report)))

      alert("อัปเดตสถานะรายงานสำเร็จ")
    } catch (err) {
      console.error("Error updating report status:", err)
      alert(`เกิดข้อผิดพลาด: ${err.response?.data?.error || err.message}`)
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
    <div className="p-6 min-h-screen">
      <div className="flex flex-wrap md:flex-nowrap space-y-4 md:space-y-0 md:space-x-4">
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

        <div className="card-body shadow-2xl w-2xl rounded-lg">
          <div className="flex items-center rounded-lg">
            <div className="text-4xl font-bold text-base-content mb-6">รายงาน</div>
          </div>
          <div className="overflow-y-scroll h-96">
            {reports.length === 0 ? (
              <div className="text-center py-4 text-gray-500">ไม่มีรายงานในขณะนี้</div>
            ) : (
              reports.map((report, index) => (
                <div
                  key={report.id || index}
                  tabIndex={0}
                  className="collapse collapse-plus bg-base-100 border-base-300 border mb-2"
                >
                  <div className="collapse-title font-semibold flex items-center">
                    <span>
                      ห้อง {report.room} ({report.user})
                    </span>
                    <div className="ml-auto flex items-center">
                      {report.status === "PENDING" && <span className="badge badge-warning mr-2">รอดำเนินการ</span>}
                      {report.status === "INVESTIGATING" && <span className="badge badge-info mr-2">กำลังตรวจสอบ</span>}
                      {report.status === "RESOLVED" && <span className="badge badge-success mr-2">แก้ไขแล้ว</span>}
                    </div>
                  </div>
                  <div className="collapse-content text-sm">
                    <p>
                      <strong>หัวข้อ:</strong> {report.options}
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
                          onClick={() => handleUpdateReportStatus(report.id, "PENDING")}
                        >
                          <Clock className="h-3 w-3 mr-1" /> รอดำเนินการ
                        </button>
                      )}
                      {report.status !== "INVESTIGATING" && (
                        <button
                          className="btn btn-xs btn-info"
                          onClick={() => handleUpdateReportStatus(report.id, "INVESTIGATING")}
                        >
                          <AlertCircle className="h-3 w-3 mr-1" /> กำลังตรวจสอบ
                        </button>
                      )}
                      {report.status !== "RESOLVED" && (
                        <button
                          className="btn btn-xs btn-success"
                          onClick={() => handleUpdateReportStatus(report.id, "RESOLVED")}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" /> แก้ไขแล้ว
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page

