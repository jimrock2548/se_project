"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (formData.password !== formData.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/setup/first-admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            phone: formData.phone,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "เกิดข้อผิดพลาดในการลงทะเบียน")
        setIsLoading(false)
        return
      }

      setSuccess("ลงทะเบียนสำเร็จ! กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...")
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (error) {
      console.error("Registration error:", error)
      setError("เกิดข้อผิดพลาดในการลงทะเบียน โปรดลองอีกครั้ง")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center" 
         style={{ backgroundImage: "url(https://img.daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.webp)" }}>
      <div className="backdrop-blur-md bg-white/10 p-8 rounded-2xl shadow-lg w-full max-w-lg border border-white/30">
        <h1 className="text-center text-3xl font-bold text-white mb-6">Register</h1>

        {error && (
          <div className="alert alert-error text-white text-center py-2 mb-4">{error}</div>
        )}
        {success && (
          <div className="alert alert-success text-white text-center py-2 mb-4">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Username", name: "username", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Full Name", name: "fullName", type: "text" },
            { label: "Phone", name: "phone", type: "tel" },
            { label: "Password", name: "password", type: "password" },
            { label: "Confirm Password", name: "confirmPassword", type: "password" },
          ].map(({ label, name, type }) => (
            <div key={name}>
              <label className="block text-white mb-1">{label}</label>
              <input
                type={type}
                name={name}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white focus:outline-none"
                value={formData[name]}
                onChange={handleChange}
                required
              />
            </div>
          ))}

          <button
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "กำลังลงทะเบียน..." : "Register"}
          </button>
        </form>

        <div className="text-center mt-4 text-white">
          Already have an account?
          <Link href="/" className="font-bold text-blue-300 hover:underline ml-1">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}
