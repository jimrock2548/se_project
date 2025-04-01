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
   const [token, setToken] = useState("")


  useEffect(() => {
    // Check if user is authenticated and has landlord role
    const checkAuth = async () => {
      const token = sessionStorage.getItem("authToken") || localStorage.getItem("authToken")

      if (!token) {
        router.push("/")
        return
      }

      try {
        // Fetch current user data
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL }/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          // Token is invalid or expired
          sessionStorage.removeItem("authToken")
          localStorage.removeItem("authToken")
          router.push("/")
          return
        }

        const data = await response.json()

        // Check if user has landlord role
        if (data.user.role !== "LANDLORD") {
          // Redirect to dashboard if not a landlord
          alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้ เฉพาะเจ้าของหอพักเท่านั้น")
          router.push("/home")
          return
        }

        setUser(data.user)
        setIsLoading(false)
      } catch (error) {
        console.error("Authentication error:", error)
        router.push("/")
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
              <Link href="/landlord/room-management" className="hover:bg-base-300 rounded-lg text-lg">
                👤 รายชื่อผู้อยู่อาศัย / จัดการห้อง
              </Link>
            </li>
            <li className="w-full border-t-1 border-base-300 pt-1">
              <Link href="/landlord/meter-management" className="hover:bg-base-300 rounded-lg text-lg">
                ⚙️ ตั้งค่า มิเตอร์
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

