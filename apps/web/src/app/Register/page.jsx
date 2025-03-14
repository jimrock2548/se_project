"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("RESIDENT");
  const [roomId, setRoomId] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [token, setToken] = useState("");

  // ดึงข้อมูลห้องพัก
  useEffect(() => {
    // ตรวจสอบว่ามี token ใน localStorage หรือไม่
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchRooms(storedToken);
    }
  }, []);

  // ฟังก์ชันดึงข้อมูลห้องพัก
  const fetchRooms = async (authToken) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/rooms`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      } else {
        console.error("Failed to fetch rooms");
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // ตรวจสอบข้อมูลที่จำเป็น
      if (!username || !email || !fullName) {
        setError("กรุณากรอกข้อมูลที่จำเป็น: ชื่อผู้ใช้, อีเมล, และชื่อ-นามสกุล");
        setIsLoading(false);
        return;
      }

      // ตรวจสอบว่ามี token หรือไม่
      if (!token) {
        setError("คุณไม่มีสิทธิ์ในการลงทะเบียนผู้ใช้ใหม่ กรุณาเข้าสู่ระบบด้วยบัญชีเจ้าของหอพักหรือผู้ดูแลระบบ");
        setIsLoading(false);
        return;
      }

      // ตรวจสอบข้อมูลเพิ่มเติมสำหรับ RESIDENT
      if (role === "RESIDENT") {
        if (!roomId) {
          setError("กรุณาเลือกห้องพัก");
          setIsLoading(false);
          return;
        }
        if (!checkInDate) {
          setError("กรุณาระบุวันที่เข้าพัก");
          setIsLoading(false);
          return;
        }
      }

      // เตรียมข้อมูลสำหรับส่งไปยัง API
      const userData = {
        username,
        email,
        fullName,
        phone,
        role,
      };

      // เพิ่มข้อมูลเฉพาะสำหรับ RESIDENT
      if (role === "RESIDENT") {
        userData.roomId = roomId;
        userData.checkInDate = checkInDate;
      }

      // ส่งข้อมูลไปยัง API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "การลงทะเบียนล้มเหลว");
      }

      // แสดงข้อความสำเร็จและรหัสผ่านชั่วคราว
      setSuccess(`ลงทะเบียนผู้ใช้ ${data.user.username} สำเร็จ! รหัสผ่านชั่วคราว: ${data.tempPassword}`);
      
      // รีเซ็ตฟอร์ม
      setUsername("");
      setEmail("");
      setFullName("");
      setPhone("");
      setRole("RESIDENT");
      setRoomId("");
      setCheckInDate("");
      setPassword("");
      setConfirmPassword("");
      
      // นำทางไปยังหน้าอื่นหลังจากลงทะเบียนสำเร็จ (ถ้าต้องการ)
      // setTimeout(() => {
      //   router.push("/dashboard");
      // }, 3000);
    } catch (error) {
      setError(error.message || "เกิดข้อผิดพลาดในการลงทะเบียน");
    } finally {
      setIsLoading(false);
    }
  };

  // หน้า Login สำหรับผู้ใช้ที่ยังไม่ได้เข้าสู่ระบบ
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!username || !password) {
        setError("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "การเข้าสู่ระบบล้มเหลว");
      }

      // บันทึก token ใน localStorage
      localStorage.setItem("token", data.token);
      setToken(data.token);

      // ดึงข้อมูลห้องพัก
      fetchRooms(data.token);

      setSuccess("เข้าสู่ระบบสำเร็จ! คุณสามารถลงทะเบียนผู้ใช้ใหม่ได้แล้ว");
      
      // รีเซ็ตฟอร์ม
      setPassword("");
    } catch (error) {
      setError(error.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="hero min-h-screen"
      style={{ backgroundImage: "url(https://img.daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.webp)" }}
    >
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="card bg-base-100 bg-opacity-50 w-full max-w-md shrink-0 shadow-2xl m-4 border-1">
          {!token ? (
            // แสดงฟอร์ม Login ถ้ายังไม่มี token
            <form className="card-body" onSubmit={handleLogin}>
              <h1 className="text-center text-3xl font-bold pb-5 text-black">เข้าสู่ระบบ</h1>
              
              {error && <div className="alert alert-error mb-4">{error}</div>}
              {success && <div className="alert alert-success mb-4">{success}</div>}
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-black">ชื่อผู้ใช้</span>
                </label>
                <input 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)} 
                  type="text" 
                  placeholder="ชื่อผู้ใช้" 
                  className="input input-bordered" 
                  required 
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-black">รหัสผ่าน</span>
                </label>
                <input 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                  type="password" 
                  placeholder="รหัสผ่าน" 
                  className="input input-bordered" 
                  required 
                />
              </div>
              
              <div className="form-control mt-6">
                <button 
                  type="submit" 
                  className="btn glass text-black"
                  disabled={isLoading}
                >
                  {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                </button>
              </div>
            </form>
          ) : (
            // แสดงฟอร์มลงทะเบียนถ้ามี token แล้ว
            <form className="card-body" onSubmit={submit}>
              <h1 className="text-center text-3xl font-bold pb-5 text-black">ลงทะเบียนผู้ใช้ใหม่</h1>
              
              {error && <div className="alert alert-error mb-4">{error}</div>}
              {success && <div className="alert alert-success mb-4">{success}</div>}
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-black">ชื่อผู้ใช้</span>
                </label>
                <input 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)} 
                  type="text" 
                  placeholder="ชื่อผู้ใช้" 
                  className="input input-bordered" 
                  required 
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-black">อีเมล</span>
                </label>
                <input 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} 
                  type="email" 
                  placeholder="อีเมล" 
                  className="input input-bordered" 
                  required 
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-black">ชื่อ-นามสกุล</span>
                </label>
                <input 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)} 
                  type="text" 
                  placeholder="ชื่อ-นามสกุล" 
                  className="input input-bordered" 
                  required 
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-black">เบอร์โทรศัพท์</span>
                </label>
                <input 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)} 
                  type="tel" 
                  placeholder="เบอร์โทรศัพท์" 
                  className="input input-bordered" 
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-black">บทบาท</span>
                </label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)} 
                  className="select select-bordered w-full"
                >
                  <option value="RESIDENT">ผู้พักอาศัย</option>
                  <option value="LANDLORD">เจ้าของหอพัก</option>
                  <option value="ADMIN">ผู้ดูแลระบบ</option>
                </select>
              </div>
              
              {role === "RESIDENT" && (
                <>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-black">ห้องพัก</span>
                    </label>
                    <select 
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)} 
                      className="select select-bordered w-full"
                      required
                    >
                      <option value="">เลือกห้องพัก</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          ห้อง {room.roomNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-black">วันที่เข้าพัก</span>
                    </label>
                    <input 
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)} 
                      type="date" 
                      className="input input-bordered" 
                      required 
                    />
                  </div>
                </>
              )}
              
              <div className="form-control mt-6">
                <button 
                  type="submit" 
                  className="btn glass text-black"
                  disabled={isLoading}
                >
                  {isLoading ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
                </button>
              </div>
              
              <div className="form-control mt-2">
                <button 
                  type="button" 
                  className="btn btn-outline glass text-black"
                  onClick={() => {
                    localStorage.removeItem("token");
                    setToken("");
                  }}
                >
                  ออกจากระบบ
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}