"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  // ตรวจสอบว่ามี token อยู่แล้วหรือไม่
  useEffect(() => {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("authToken")

    if (token) {
      // ถ้ามี token อยู่แล้ว ให้ redirect ไปหน้า dashboard
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      if (user.role === "LANDLORD") {
        router.push("/landlord/dashboard")
      } else {
        router.push("/auth/home")
      }
    }
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      console.log("Attempting login to:", `${apiUrl}/auth/login`)

      const response = await axios.post(`${apiUrl}/auth/login`, {
        email,
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
          router.push("/landlord/dashboard")
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

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Sign In
            </button>
            <a className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="#">
              Forgot Password?
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

