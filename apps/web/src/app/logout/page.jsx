"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const logout = async () => {
      try {
        // Call logout API (optional)
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/logout`, {
          method: "POST",
        })
      } catch (error) {
        console.error("Logout error:", error)
      } finally {
        // Clear auth tokens
        sessionStorage.removeItem("authToken")
        localStorage.removeItem("authToken")
        sessionStorage.removeItem("userData")

        // Redirect to login page
        router.push("/")
      }
    }

    logout()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold">กำลังออกจากระบบ...</h2>
      </div>
    </div>
  )
}

