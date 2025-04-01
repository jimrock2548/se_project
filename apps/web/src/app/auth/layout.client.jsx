"use client"
import "../globals.css"
import Link from "next/link"
import { useEffect, useState } from "react"
import { themeChange } from "theme-change"

export default function AuthLayoutClient({ children }) {
  const [isNight, setIsNight] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    // Check if user is logged in
    const token = sessionStorage.getItem("authToken") || localStorage.getItem("authToken")
    setIsLoggedIn(!!token)

    // Get user data from session storage
    const storedUserData = sessionStorage.getItem("userData")
    if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData)
        setUserData(parsedUserData)
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

  useEffect(() => {
    // Initialize theme-change ONLY ONCE
    themeChange(false)
    // Set default theme on mount
    const htmlElement = document.documentElement
    htmlElement.setAttribute("data-theme", isNight ? "dark" : "winter")
  }, []) // Empty dependency array ensures this runs only once

  useEffect(() => {
    // Update data-theme attribute whenever isNight changes
    const htmlElement = document.documentElement
    htmlElement.setAttribute("data-theme", isNight ? "dark" : "winter")
  }, [isNight]) // Run when isNight changes

  const handleThemeChange = (e) => {
    setIsNight(!isNight) // Toggle the state directly
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
                  className="inline -block text-base-content h-5 w-5 stroke-current"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </label>
            </div>

            <div className="flex-1 text-base-content text-3xl font-bold p-2">S.T. APARTMENT</div>

            {/* Theme Changer */}
            <label className="swap swap-rotate">
              {/* this hidden checkbox controls the state */}
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
                    <Link href="/auth/setting_" className="hover:bg-info-content rounded-lg">
                      ตั้งค่า
                    </Link>
                  </li>
                  <li>
                    <Link href="/Login" className="hover:bg-info-content rounded-lg">
                      เข้าสู่ระบบ
                    </Link>
                  </li>
                  <li>
                    <Link href="/Login" className="hover:bg-info-content rounded-lg">
                      ลงทะเบียน
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
              <div className="text-2xl font-bold pb-2">{userData?.fullName || "ผู้ใช้งาน"}</div>
              <p>
                <d>เลขที่ห้อง :</d> {userData?.resident?.roomId ? userData.resident.roomId : "ไม่ระบุ"}
              </p>
            </div>

            {/* Sidebar Menu */}
            <li className="w-full border-t-1 border-base-300 pt-2">
              <Link href="/auth/home" className="hover:bg-base-300 rounded-lg text-lg">
                🏠 หน้าแรก
              </Link>
            </li>
            <li className="w-full ">
              <Link href="/auth/payment" className="hover:bg-base-300 rounded-lg text-lg">
                💵 ชำระค่าเช่า
              </Link>
            </li>
            <li className="w-full py-1">
              <Link href="/auth/chat" className="hover:bg-base-300 rounded-lg text-lg">
                ✉️ แชท
              </Link>
            </li>

            <li className="w-full border-t-1 border-base-300 pt-1">
              <Link href="/auth/report" className="hover:bg-base-300 rounded-lg text-lg">
                📢 รายงาน
              </Link>
            </li>
            <li className="w-full ">
              <Link href="/auth/setting" className="hover:bg-base-300 rounded-lg text-lg">
                ⚙️ ตั้งค่าโปรไฟล์
              </Link>
            </li>
            <div className="pt-28">
              {isLoggedIn ? (
                <button className="btn btn-outline btn-primary">
                  <Link href="/logout">ออกจากระบบ</Link>
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
      <footer className="footer bg-base-100 text-neutral-content p-10 mt-auto">
        <nav>
          <h6 className="footer-title text-base">Social</h6>
          <div className="grid grid-flow-col gap-4 ">
            <a>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                color="color-base"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-current"
              >
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
              </svg>
            </a>
            <a>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                color="color-base"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-current"
              >
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
              </svg>
            </a>
            <a>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                color="color-base"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-current"
              >
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
              </svg>
            </a>
          </div>
        </nav>
      </footer>
    </>
  )
}

