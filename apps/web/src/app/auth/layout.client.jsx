"use client"
import "../globals.css"
import Link from "next/link"
import { useEffect, useState } from "react"
import axios from "axios"

export default function AuthLayoutClient({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    // Check if user is logged in
    const storedToken = sessionStorage.getItem("authToken") || localStorage.getItem("authToken")

    const fetchUserData = async () => {
      if (!storedToken) {
        setLoading(false)
        return
      }

      try {
        console.log("Fetching user data with token:", storedToken)
        const response = await axios.get(`${apiUrl}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        })
        console.log("User data response:", response.data)
        setUserData(response.data)
        setIsLoggedIn(true)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching user data:", error)
        setLoading(false)
      }
    }

    fetchUserData()
  }, [apiUrl])

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem("authToken")
    sessionStorage.removeItem("authToken")
    setIsLoggedIn(false)
    setUserData(null)
    window.location.href = "/"
  }

  

  return (
    <>
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
                  className="inline-block text-base-content h-5 w-5 stroke-current"
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
                    <Link href="/auth/home" className="hover:bg-info-content rounded-lg">
                      หน้าแรก
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/payment" className="hover:bg-info-content rounded-lg">
                      ชำระค่าเช่า
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/chat" className="hover:bg-info-content rounded-lg">
                      แชท
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/report" className="hover:bg-info-content rounded-lg">
                      รายงาน
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/setting" className="hover:bg-info-content rounded-lg">
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
           

            {/* Sidebar Menu */}
            <li className="w-full border-t-1 border-base-300 pt-2">
              <Link href="/auth/home" className="hover:bg-base-300 rounded-lg text-lg">
                🏠 หน้าแรก
              </Link>
            </li>
            <li className="w-full">
              <Link href="/auth/payment" className="hover:bg-base-300 rounded-lg text-lg">
                💵 ชำระค่าเช่า
              </Link>
            </li>
            <li className="w-full py-1">
              <Link href="/auth/chat" className="hover:bg-base-300 rounded-lg text-lg">
                💬 แชท
              </Link>
            </li>
            <li className="w-full border-t-1 border-base-300 pt-1">
              <Link href="/auth/report" className="hover:bg-base-300 rounded-lg text-lg">
                📢 รายงาน
              </Link>
            </li>
            <li className="w-full">
              <Link href="/auth/setting" className="hover:bg-base-300 rounded-lg text-lg">
                ⚙️ ตั้งค่าโปรไฟล์
              </Link>
            </li>

            <div className="pt-28">
              {isLoggedIn ? (
                <button onClick={handleLogout} className="btn btn-outline btn-primary">
                  ออกจากระบบ
                </button>
              ) : (
                <div className="space-x-1 flex items-baseline">
                  <div>
                    <button className="btn btn-outline btn-primary">
                      <Link href="/">เข้าสู่ระบบ</Link>
                    </button>
                  </div>
                  <div className="pt-5">
                    <button className="btn btn-outline btn-primary">
                      <Link href="/Register">ลงทะเบียน</Link>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </ul>
        </div>
      </div>
    </>
  )
}

