"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import localFont from "next/font/local"
import { themeChange } from "theme-change"

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export default function LandlordLayout({ children }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [isNight, setIsNight] = useState(false)

  useEffect(() => {
    // Initialize theme-change
    themeChange(false)
    // Set default theme on mount
    const htmlElement = document.documentElement
    htmlElement.setAttribute("data-theme", isNight ? "dark" : "winter")
  }, [])

  useEffect(() => {
    // Update data-theme attribute whenever isNight changes
    const htmlElement = document.documentElement
    htmlElement.setAttribute("data-theme", isNight ? "dark" : "winter")
  }, [isNight])

  const handleThemeChange = () => {
    setIsNight(!isNight)
  }

  useEffect(() => {
    // Check if user is authenticated and has landlord role
    const checkAuth = async () => {
      const token = sessionStorage.getItem("authToken") || localStorage.getItem("authToken")

      if (!token) {
        router.push("/login")
        return
      }

      try {
        // Fetch current user data
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          // Token is invalid or expired
          sessionStorage.removeItem("authToken")
          localStorage.removeItem("authToken")
          router.push("/login")
          return
        }

        const data = await response.json()

        // Check if user has landlord role
        if (data.user.role !== "LANDLORD") {
          // Redirect to dashboard if not a landlord
          alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้ เฉพาะเจ้าของหอพักเท่านั้น")
          router.push("/dashboard")
          return
        }

        setUser(data.user)
        setIsLoading(false)
      } catch (error) {
        console.error("Authentication error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col`}>
      {/* Drawer Layout */}
      <div className="drawer">
        {/* Toggle Drawer */}
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />

        {/* Main Content */}
        <div className="drawer-content flex flex-col">
          {/* Navbar */}
          <div className="navbar bg-base-100 p-4 shadow-md">
            <div className="flex-none">
              <label htmlFor="my-drawer" className="btn btn-square btn-ghost">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline -block text-base-content h-5 w-5 stroke-current"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </label>
            </div>

            <div className="flex-1 text-base-content text-3xl font-bold p-2">S.T. APARTMENT</div>

            {/* Theme Changer */}
            <label className="swap swap-rotate">
              <input
                type="checkbox"
                className="theme-controller"
                value="isNight"
                checked={isNight}
                onChange={handleThemeChange}
              />

              {/* sun icon */}
              <svg className="swap-off h-8 w-8 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
              </svg>

              {/* moon icon */}
              <svg className="swap-on h-8 w-8 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
              </svg>
            </label>

            <div className="flex-none">
              <div className="dropdown dropdown-bottom dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="inline-block text-base-content h-5 w-5 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                    ></path>
                  </svg>
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-content text-base-100 rounded-box w-52 p-2 shadow"
                >
                  <li>
                    <Link href="/landlord/home" className="hover:bg-info-content rounded-lg">
                      หน้าแรก
                    </Link>
                  </li>
                  <li>
                    <Link href="/landlord/billsform" className="hover:bg-info-content rounded-lg">
                      กรอกใบชำระค่าเช่า
                    </Link>
                  </li>
                  <li>
                    <Link href="/landlord/list" className="hover:bg-info-content rounded-lg">
                      รายชื่อผู้อยู่อาศัย
                    </Link>
                  </li>
                  <li>
                    <Link href="/landlord/setting_" className="hover:bg-info-content rounded-lg">
                      ตั้งค่า
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Children Content */}
          <main className="p-6 flex-grow">{children}</main>
        </div>

        {/* Sidebar Content */}
        <div className="drawer-side z-50">
          <label htmlFor="my-drawer" className="drawer-overlay"></label>
          <ul className="menu bg-base-100 text-base-content min-h-screen w-80 p-4 flex flex-col items-center">
            <div className="text-base-content text-3xl font-bold p-2 pt-1">S.T. APARTMENT</div>
            {/* Profile Image */}
            <img
              className="w-36 h-36 rounded-full object-cover mt-4"
              alt="Profile"
              src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
            />

            {/* Profile Name */}
            <div className="m-4 text-center">
              <div className="text-2xl font-bold">{user.fullName}</div>
              <div className="text-sm opacity-70">ผู้ดูแลหอพัก</div>
            </div>

            {/* Sidebar Menu */}
            <li className="w-full border-t-1 border-base-300 pt-1">
              <Link href="/landlord/home" className="hover:bg-base-300 rounded-lg text-lg">
                🏠 ประกาศ / รายงาน
              </Link>
            </li>
            <li className="w-full pb-1">
              <Link href="/landlord/billsform" className="hover:bg-base-300 rounded-lg text-lg">
                📋 กรอกใบชำระค่าเช่า
              </Link>
            </li>
            <li className="w-full pb-1">
              <Link href="/landlord/list" className="hover:bg-base-300 rounded-lg text-lg">
                👤 รายชื่อผู้อยู่อาศัย
              </Link>
            </li>
            <li className="w-full border-t-1 border-base-300 pt-1">
              <Link href="/landlord/setting_" className="hover:bg-base-300 rounded-lg text-lg">
                ⚙️ ตั้งค่า
              </Link>
            </li>
            <div className="mt-auto mb-4">
              <button className="btn btn-outline btn-primary">
                <Link href="/logout">ออกจากระบบ</Link>
              </button>
            </div>
          </ul>
        </div>
      </div>
    </div>
  )
}

