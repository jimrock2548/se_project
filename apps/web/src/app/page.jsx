"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง")
        setIsLoading(false)
        return
      }

      // Store token in localStorage if remember me is checked
      if (rememberMe && data.token) {
        localStorage.setItem("authToken", data.token)
      }

      // Store token in sessionStorage regardless
      if (data.token) {
        sessionStorage.setItem("authToken", data.token)
        // Store user data
        sessionStorage.setItem("userData", JSON.stringify(data.user))
      }

      // Redirect to dashboard
      router.push("/landlord/home")
    } catch (error) {
      console.error("Login error:", error)
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ โปรดลองอีกครั้ง")
      setIsLoading(false)
    }
  }

  return (
    <>
      <div
        className="hero min-h-screen"
        style={{ backgroundImage: "url(https://img.daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.webp)" }}
      >
        <div className="hero-content flex-col lg:flex-row-reverse">
          <div className="card bg-base-100 bg-opacity-50 w-full max-w-sm shrink-0 shadow-2xl m-56 border-1">
            {error && (
              <div className="alert alert-error mt-4 mx-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}
            <form className="card-body" onSubmit={handleSubmit}>
              <div className="form-control">
                <h1 className="text-center text-3xl font-bold pb-5 text-black">Login</h1>
                <label className="label">
                  <span className="label-text text-black">Username / Email</span>
                </label>
                <input
                  type="text"
                  placeholder="Username / Email"
                  className="input input-bordered"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-black">Password</span>
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  className="input input-bordered"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label className="label pt-4">
                  <label className="label-text-alt text-black">
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />{" "}
                    Remember me
                  </label>
                  <a href="#" className="label-text-alt link link-hover text-black">
                    Forgot password?
                  </a>
                </label>
              </div>
              <div className="form-control mt-6">
                <button className="btn glass text-black" type="submit" disabled={isLoading}>
                  {isLoading ? "กำลังเข้าสู่ระบบ..." : "Login"}
                </button>
              </div>
              <div className="text-center label-text-alt py-2">
                <h3 className="text-black">
                  Don't have an account? 
                </h3>
                <h3 className="text-black">
                  Please request an account from the administrator.
                </h3>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
