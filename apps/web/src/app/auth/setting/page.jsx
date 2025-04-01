"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { LogOut, ArrowLeft, Eye, EyeOff, Save } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    fullName: "",
  })
  const [activeTab, setActiveTab] = useState("profile") // profile, password
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token")

        if (!token) {
          router.push("/")
          return
        }

        // ดึงข้อมูลผู้ใช้จาก localStorage ก่อนเพื่อแสดงผลเร็วๆ
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser)
            console.log("User data from localStorage:", parsedUser)
            setUserData(parsedUser)
            setFormData({
              username: parsedUser.username || "",
              email: parsedUser.email || "",
              phoneNumber: parsedUser.phoneNumber || "",
              fullName: parsedUser.fullName || "",
            })
            console.log("Form data set from localStorage:", {
              username: parsedUser.username || "",
              email: parsedUser.email || "",
              phoneNumber: parsedUser.phoneNumber || "",
              fullName: parsedUser.fullName || "",
            })
          } catch (e) {
            console.error("Error parsing user data:", e)
          }
        }

        // พยายามดึงข้อมูลจาก API
        try {
          console.log("Fetching user profile from API...")
          const response = await axios.get(`${apiUrl}/api/users/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          console.log("API response data:", response.data)
          console.log("User phone number from API:", response.data.user.phoneNumber)

          // บันทึกข้อมูลผู้ใช้ลงใน state
          setUserData(response.data.user)

          // ตั้งค่าข้อมูลในฟอร์ม
          setFormData({
            username: response.data.user.username || "",
            email: response.data.user.email || "",
            phoneNumber: response.data.user.phoneNumber || "",
            fullName: response.data.user.fullName || "",
          })

          console.log("Form data after setting from API:", {
            username: response.data.user.username || "",
            email: response.data.user.email || "",
            phoneNumber: response.data.user.phoneNumber || "",
            fullName: response.data.user.fullName || "",
          })

          // อัปเดตข้อมูลใน localStorage ให้ตรงกับข้อมูลล่าสุดจาก API
          localStorage.setItem("user", JSON.stringify(response.data.user))
        } catch (apiError) {
          console.error("Error fetching from API:", apiError)
          // ไม่ต้องแสดง error ถ้าเราได้ข้อมูลจาก localStorage แล้ว
          if (!userData) {
            setError("ไม่สามารถโหลดข้อมูลผู้ใช้ได้")
          }
        }
      } catch (err) {
        console.error("Error in fetchUserData:", err)
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [apiUrl, router])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage("")

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")

      if (!token) {
        router.push("/")
        return
      }

      console.log("Updating profile with data:", formData)

      const response = await axios.put(
        `${apiUrl}/api/users/profile`,
        {
          username: formData.username,
          email: formData.email,
          fullName: formData.fullName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      console.log("Update response:", response.data)

      // อัปเดตข้อมูลใน state และ localStorage
      const updatedUser = response.data.user
      setUserData(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))

      setSuccessMessage("อัปเดตข้อมูลสำเร็จ")

      // ซ่อนข้อความสำเร็จหลังจาก 3 วินาที
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error("Error updating profile:", err)
      setError(err.response?.data?.error || err.response?.data?.message || "ไม่สามารถอัปเดตข้อมูลได้")
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage("")
    setIsSubmitting(true)

    // ตรวจสอบว่ารหัสผ่านใหม่และยืนยันรหัสผ่านตรงกัน
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน")
      setIsSubmitting(false)
      return
    }

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")

      if (!token) {
        router.push("/")
        return
      }

      const response = await axios.put(
        `${apiUrl}/api/users/password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      setSuccessMessage("เปลี่ยนรหัสผ่านสำเร็จ")

      // รีเซ็ตฟอร์ม
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      // ซ่อนข้อความสำเร็จหลังจาก 3 วินาที
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error("Error updating password:", err)
      setError(err.response?.data?.error || err.response?.data?.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("authToken")
    localStorage.removeItem("authToken")
    router.push("/")
  }

  const getInitials = (name) => {
    if (!name) return "U"
    return name.charAt(0).toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/auth/home" className="flex items-center text-gray-700">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span>กลับ</span>
              </Link>
            </div>
            <h1 className="text-xl font-bold">ข้อมูลส่วนตัว</h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* User Profile Header */}
          <div className="p-6 flex items-center border-b border-gray-200">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
              {getInitials(userData?.fullName)}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{userData?.fullName}</h2>
              <p className="text-gray-600">ห้อง {userData?.roomNumber || "-"}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-3 px-4 text-center ${activeTab === "profile" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
              onClick={() => setActiveTab("profile")}
            >
              ข้อมูลส่วนตัว
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center ${activeTab === "password" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
              onClick={() => setActiveTab("password")}
            >
              เปลี่ยนรหัสผ่าน
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === "profile" && (
              <form onSubmit={handleProfileUpdate}>
                <div className="mb-4">
                  <label htmlFor="username" className="block text-gray-700 mb-2">
                    ชื่อผู้ใช้
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 mb-2">
                    อีเมล
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="fullName" className="block text-gray-700 mb-2">
                    ชื่อ-นามสกุล
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    บันทึกข้อมูล
                  </button>
                </div>
              </form>
            )}

            {activeTab === "password" && (
              <form onSubmit={handlePasswordUpdate}>
                <div className="mb-4">
                  <label htmlFor="currentPassword" className="block text-gray-700 mb-2">
                    รหัสผ่านปัจจุบัน
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="newPassword" className="block text-gray-700 mb-2">
                    รหัสผ่านใหม่
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร</p>
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
                    ยืนยันรหัสผ่านใหม่
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-blue-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        กำลังบันทึก...
                      </>
                    ) : (
                      "เปลี่ยนรหัสผ่าน"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ปุ่มออกจากระบบ */}
        <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center py-3 px-4 hover:bg-gray-50 text-red-500"
          >
            <LogOut className="h-5 w-5 mr-2" />
            <span>ออกจากระบบ</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© 2025 ระบบจัดการหอพัก. สงวนลิขสิทธิ์.</p>
        </div>
      </div>
    </div>
  )
}

