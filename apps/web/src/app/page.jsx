"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"

export default function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()

  // ตรวจสอบว่ามี token อยู่แล้วหรือไม่
  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true)

      try {
        const token =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token") ||
          localStorage.getItem("authToken") ||
          sessionStorage.getItem("authToken")

        if (!token) {
          setIsCheckingAuth(false)
          return
        }

        // ตรวจสอบว่า token ยังใช้งานได้หรือไม่
        const apiUrl = process.env.NEXT_PUBLIC_API_URL 
        try {
          // ทำการตรวจสอบ token โดยเรียก API ที่ต้องใช้ token
          await axios.get(`${apiUrl}/api/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          // ถ้าไม่มี error แสดงว่า token ยังใช้งานได้
          const user = JSON.parse(localStorage.getItem("user") || "{}")
          if (user.role === "LANDLORD") {
            router.push("/landlord/home")
          } else {
            router.push("/auth/home")
          }
        } catch (err) {
          // ถ้ามี error แสดงว่า token หมดอายุหรือไม่ถูกต้อง
          console.log("Token invalid or expired, clearing...")
          localStorage.removeItem("token")
          sessionStorage.removeItem("token")
          localStorage.removeItem("authToken")
          sessionStorage.removeItem("authToken")
          localStorage.removeItem("user")
        }
      } catch (err) {
        console.error("Auth check error:", err)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      console.log("Attempting login to:", `${apiUrl}/api/auth/login`)

      // ส่งทั้ง username และ email ไปที่ API
      // API จะตรวจสอบว่าเป็น username หรือ email เอง
      const response = await axios.post(`${apiUrl}/api/auth/login`, {
        username: usernameOrEmail, // ส่งเป็น username
        email: usernameOrEmail, // ส่งเป็น email ด้วย
        password,
      })

      if (response.status === 200 && response.data.token) {
        console.log("Login successful, saving token...")

        // บันทึก token ทั้งใน localStorage และ sessionStorage ด้วยหลายชื่อเพื่อความเข้ากันได้
        localStorage.setItem("token", response.data.token)
        sessionStorage.setItem("token", response.data.token)
        localStorage.setItem("authToken", response.data.token)
        sessionStorage.setItem("authToken", response.data.token)

        // บันทึกข้อมูลผู้ใช้
        localStorage.setItem("user", JSON.stringify(response.data.user))

        console.log("Token saved successfully:", response.data.token.substring(0, 20) + "...")
        console.log("User role:", response.data.user.role)

        // เปลี่ยนเส้นทางตามบทบาท
        if (response.data.user.role === "LANDLORD") {
          router.push("/landlord/home")
        } else if (response.data.user.role === "RESIDENT") {
          router.push("/auth/home")
        } else {
          router.push("/auth/home")
        }
      } else {
        setError("Invalid credentials")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError(error.response?.data?.message || "Invalid credentials")
    }
  }

  // แสดง loading ระหว่างตรวจสอบ authentication
  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-96 text-center">
          <p>กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="usernameOrEmail" className="block text-gray-700 text-sm font-bold mb-2">
              Username or Email
            </label>
            <input
              type="text"
              id="usernameOrEmail"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="Enter your username or email"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

