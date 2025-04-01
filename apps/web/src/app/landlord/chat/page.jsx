"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { io } from "socket.io-client"
import { Send, Search, Users, Menu, X, RefreshCw, PlusCircle } from "lucide-react"

export default function LandlordChatPage() {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userData, setUserData] = useState(null)
  const [showUserList, setShowUserList] = useState(false)
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState({})
  const [unreadCounts, setUnreadCounts] = useState({})
  const [totalUnread, setTotalUnread] = useState(0)
  const messagesEndRef = useRef(null)
  const messageInputRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
  const router = useRouter()

  // เริ่มต้นการเชื่อมต่อ Socket.io
  useEffect(() => {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("authToken")

    if (!token) {
      setError("กรุณาเข้าสู่ระบบก่อน")
      router.push("/")
      return
    }

    console.log("Connecting to Socket.io at:", apiUrl)

    // สร้างการเชื่อมต่อ Socket.io
    const socketInstance = io(apiUrl, {
      auth: { token },
      transports: ["polling", "websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: true,
    })

    socketInstance.on("connect", () => {
      console.log("Socket connected with ID:", socketInstance.id)
      setIsConnected(true)

      // เมื่อเชื่อมต่อสำเร็จ ให้ดึงข้อมูลการสนทนาและจำนวนข้อความที่ยังไม่ได้อ่าน
      fetchConversations()
      fetchUnreadCounts()

      // ถ้ามีการเลือกการสนทนาอยู่แล้ว ให้เข้าร่วมห้องสนทนานั้น
      if (selectedConversation) {
        socketInstance.emit("join-conversation", selectedConversation.id)
        fetchMessages(selectedConversation.id)
      }
    })

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected, reason:", reason)
      setIsConnected(false)
    })

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message)
      setError(`การเชื่อมต่อผิดพลาด: ${err.message}`)
    })

    // รับข้อความใหม่
    socketInstance.on("new-message", (message) => {
      console.log("New message received:", message)

      if (selectedConversation && message.conversationId === selectedConversation.id) {
        setMessages((prevMessages) => {
          // ตรวจสอบว่าข้อความนี้มีอยู่แล้วหรือไม่
          const messageExists = prevMessages.some((msg) => msg.id === message.id)
          if (messageExists) return prevMessages

          return [...prevMessages, message]
        })

        // ทำเครื่องหมายว่าอ่านแล้วถ้าเป็นข้อความจากผู้อื่น
        if (message.senderId !== userData?.id) {
          markMessageAsRead(message.id)
        }
      }

      // อัปเดตข้อความล่าสุดในรายการสนทนา
      setConversations((prevConversations) => {
        const updatedConversations = prevConversations.map((conv) => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              lastMessage: {
                id: message.id,
                content: message.content,
                senderId: message.senderId,
                createdAt: message.createdAt,
              },
            }
          }
          return conv
        })

        // เรียงลำดับสนทนาใหม่
        return updatedConversations.sort((a, b) => {
          if (!a.lastMessage) return 1
          if (!b.lastMessage) return -1
          return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
        })
      })
    })

    // รับการแจ้งเตือน
    socketInstance.on("notification", (notification) => {
      console.log("Notification received:", notification)

      if (notification.type === "new-message") {
        // อัปเดตจำนวนข้อความที่ยังไม่ได้อ่าน
        if (selectedConversation?.id !== notification.conversationId) {
          setUnreadCounts((prev) => ({
            ...prev,
            [notification.conversationId]: (prev[notification.conversationId] || 0) + 1,
          }))

          setTotalUnread((prev) => prev + 1)
        }

        // อัปเดตรายการสนทนาเพื่อแสดงข้อความล่าสุด
        setConversations((prevConversations) => {
          const conversationExists = prevConversations.some((conv) => conv.id === notification.conversationId)

          if (!conversationExists) {
            // ถ้าไม่พบการสนทนานี้ในรายการ ให้ดึงข้อมูลการสนทนาใหม่ทั้งหมด
            fetchConversations()
            return prevConversations
          }

          const updatedConversations = prevConversations.map((conv) => {
            if (conv.id === notification.conversationId) {
              return {
                ...conv,
                lastMessage: {
                  id: notification.message.id,
                  content: notification.message.content,
                  senderId: notification.message.senderId,
                  createdAt: notification.message.createdAt,
                },
              }
            }
            return conv
          })

          // เรียงลำดับสนทนาใหม่
          return updatedConversations.sort((a, b) => {
            if (!a.lastMessage) return 1
            if (!b.lastMessage) return -1
            return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
          })
        })
      }
    })

    // รับการสนทนาใหม่
    socketInstance.on("new-conversation", (conversation) => {
      console.log("New conversation received:", conversation)
      setConversations((prev) => {
        // ตรวจสอบว่าการสนทนานี้มีอยู่แล้วหรือไม่
        const conversationExists = prev.some((conv) => conv.id === conversation.id)
        if (conversationExists) return prev

        return [conversation, ...prev]
      })
    })

    // รับสถานะการพิมพ์
    socketInstance.on("user-typing", (data) => {
      setTypingUsers((prev) => ({
        ...prev,
        [data.userId]: {
          fullName: data.fullName,
          timestamp: Date.now(),
        },
      }))
    })

    // รับสถานะการหยุดพิมพ์
    socketInstance.on("user-stop-typing", (data) => {
      setTypingUsers((prev) => {
        const newState = { ...prev }
        delete newState[data.userId]
        return newState
      })
    })

    // รับสถานะการอ่านข้อความ
    socketInstance.on("message-read", (data) => {
      // อัปเดตสถานะการอ่านข้อความในรายการข้อความ
      if (selectedConversation?.id === data.conversationId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg.id === data.messageId ? { ...msg, isRead: true } : msg)),
        )
      }
    })

    setSocket(socketInstance)

    // ทำความสะอาดเมื่อคอมโพเนนต์ถูกทำลาย
    return () => {
      if (socketInstance) {
        console.log("Disconnecting socket...")
        socketInstance.disconnect()
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [apiUrl, router])

  // ดึงข้อมูลเริ่มต้นเมื่อโหลดคอมโพเนนต์
  useEffect(() => {
    fetchUserData()
    // fetchConversations() และ fetchUnreadCounts() จะถูกเรียกหลังจากเชื่อมต่อ socket สำเร็จ
  }, [])

  useEffect(() => {
    if (selectedConversation && socket && isConnected) {
      console.log("Joining conversation:", selectedConversation.id)
      fetchMessages(selectedConversation.id)
      setIsMobileMenuOpen(false)

      // เข้าร่วมห้องสนทนา
      socket.emit("join-conversation", selectedConversation.id)

      // รีเซ็ตจำนวนข้อความที่ยังไม่ได้อ่านสำหรับการสนทนานี้
      if (unreadCounts[selectedConversation.id]) {
        const count = unreadCounts[selectedConversation.id]
        setUnreadCounts((prev) => ({
          ...prev,
          [selectedConversation.id]: 0,
        }))
        setTotalUnread((prev) => Math.max(0, prev - count))
      }
    }

    return () => {
      // ออกจากห้องสนทนาเมื่อเปลี่ยนการสนทนา
      if (socket && isConnected && selectedConversation) {
        console.log("Leaving conversation:", selectedConversation.id)
        socket.emit("leave-conversation", selectedConversation.id)
      }
    }
  }, [selectedConversation, socket, isConnected])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchUserData = () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}")
      if (userData && userData.id) {
        setUserData(userData)
      } else {
        setError("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่")
        router.push("/")
      }
    } catch (error) {
      console.error("Error parsing user data:", error)
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้")
    }
  }

  const fetchConversations = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken")

      if (!token) {
        setError("กรุณาเข้าสู่ระบบก่อน")
        router.push("/")
        return
      }

      const response = await axios.get(`${apiUrl}/api/chat/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Conversations:", response.data)
      setConversations(response.data.conversations || [])

      // ถ้ามีการสนทนา ให้เลือกอันแรกโดยอัตโนมัติ
      if (response.data.conversations && response.data.conversations.length > 0 && !selectedConversation) {
        setSelectedConversation(response.data.conversations[0])
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
      setError("ไม่สามารถโหลดรายการสนทนาได้")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUnreadCounts = async () => {
    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken")

      if (!token) {
        return
      }

      const response = await axios.get(`${apiUrl}/api/chat/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setUnreadCounts(response.data.unreadCounts)
      setTotalUnread(response.data.totalUnread)
    } catch (error) {
      console.error("Error fetching unread counts:", error)
    }
  }

  const fetchMessages = async (conversationId) => {
    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken")

      if (!token) {
        setError("กรุณาเข้าสู่ระบบก่อน")
        router.push("/")
        return
      }

      const response = await axios.get(`${apiUrl}/api/chat/conversations/${conversationId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Messages:", response.data)
      setMessages(response.data.messages || [])

      // ทำเครื่องหมายว่าอ่านแล้วสำหรับข้อความที่ยังไม่ได้อ่าน
      response.data.messages.forEach((message) => {
        if (!message.isRead && message.senderId !== userData?.id) {
          markMessageAsRead(message.id)
        }
      })
    } catch (error) {
      console.error("Error fetching messages:", error)
      setError("ไม่สามารถโหลดข้อความได้")
    }
  }

  const markMessageAsRead = async (messageId) => {
    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken")

      if (!token) return

      await axios.patch(
        `${apiUrl}/api/chat/messages/${messageId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // ไม่จำเป็นต้องอัปเดต UI เพราะเราจะได้รับการอัปเดตผ่าน Socket.io
    } catch (error) {
      console.error("Error marking message as read:", error)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()

    if (!newMessage.trim() || !selectedConversation) return

    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken")

      if (!token) {
        setError("กรุณาเข้าสู่ระบบก่อน")
        router.push("/")
        return
      }

      // แจ้งว่าหยุดพิมพ์
      if (socket && isConnected) {
        socket.emit("stop-typing", selectedConversation.id)
      }

      // เก็บข้อความที่จะส่ง
      const messageContent = newMessage.trim()

      // ล้างข้อความใหม่ทันที
      setNewMessage("")

      // สร้างข้อความชั่วคราวเพื่อแสดงในหน้าจอ
      const tempMessage = {
        id: `temp-${Date.now()}`,
        content: messageContent,
        senderId: userData.id,
        sender: {
          id: userData.id,
          fullName: userData.fullName,
          username: userData.username,
        },
        conversationId: selectedConversation.id,
        createdAt: new Date().toISOString(),
        isRead: false,
        isTemp: true, // เพิ่มเครื่องหมายว่าเป็นข้อความชั่วคราว
      }

      // เพิ่มข้อความชั่วคราวเข้าไปในรายการข้อความ
      setMessages((prev) => [...prev, tempMessage])

      // ส่งข้อความไปยังเซิร์ฟเวอร์
      const response = await axios.post(
        `${apiUrl}/api/chat/conversations/${selectedConversation.id}/messages`,
        { content: messageContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      console.log("Message sent:", response.data)

      // แทนที่ข้อความชั่วคราวด้วยข้อความจริง
      setMessages((prev) => prev.map((msg) => (msg.id === tempMessage.id ? response.data.message : msg)))

      // โฟกัสที่ช่องข้อความใหม่
      if (messageInputRef.current) {
        messageInputRef.current.focus()
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setError("ไม่สามารถส่งข้อความได้")

      // ลบข้อความชั่วคราวที่ไม่สามารถส่งได้
      setMessages((prev) => prev.filter((msg) => !msg.isTemp))
    }
  }

  const handleTyping = () => {
    if (socket && isConnected && selectedConversation) {
      socket.emit("typing", selectedConversation.id)

      // ยกเลิก timeout เดิม (ถ้ามี)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // ตั้ง timeout ใหม่
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop-typing", selectedConversation.id)
      }, 3000) // หยุดพิมพ์หลังจาก 3 วินาที
    }
  }

  const fetchUsers = async () => {
    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken")

      if (!token) {
        setError("กรุณาเข้าสู่ระบบก่อน")
        router.push("/")
        return
      }

      const response = await axios.get(`${apiUrl}/api/chat/users${searchTerm ? `?search=${searchTerm}` : ""}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Users:", response.data)
      setUsers(response.data.users || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      setError("ไม่สามารถโหลดรายชื่อผู้ใช้ได้")
    }
  }

  const startNewConversation = async (userId) => {
    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken")

      if (!token) {
        setError("กรุณาเข้าสู่ระบบก่อน")
        router.push("/")
        return
      }

      const response = await axios.post(
        `${apiUrl}/api/chat/conversations`,
        { participantIds: [userId] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      console.log("New conversation:", response.data)

      // ถ้าสนทนานี้มีอยู่แล้ว
      if (response.data.message === "Conversation already exists") {
        // หาสนทนาที่มีอยู่แล้วในรายการ
        const existingConversation = conversations.find((conv) => conv.id === response.data.conversation.id)

        if (existingConversation) {
          setSelectedConversation(existingConversation)
        } else {
          // ถ้าไม่พบในรายการ (อาจเกิดจากการโหลดข้อมูลไม่ครบ) ให้เพิ่มเข้าไปในรายการ
          const newConversation = {
            ...response.data.conversation,
            lastMessage: null,
          }
          setConversations([newConversation, ...conversations])
          setSelectedConversation(newConversation)
        }
      } else {
        // ถ้าเป็นสนทนาใหม่
        const newConversation = {
          ...response.data.conversation,
          lastMessage: null,
        }
        setConversations([newConversation, ...conversations])
        setSelectedConversation(newConversation)
      }

      // ปิดรายการผู้ใช้
      setShowUserList(false)
    } catch (error) {
      console.error("Error starting new conversation:", error)
      setError("ไม่สามารถเริ่มการสนทนาใหม่ได้")
    }
  }

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })
  }

  const getConversationName = (conversation) => {
    if (!conversation || !userData) return ""

    if (conversation.name) return conversation.name

    // ถ้าไม่มีชื่อสนทนา ให้ใช้ชื่อของผู้ร่วมสนทนาที่ไม่ใช่ตัวเอง
    const otherParticipants = conversation.participants.filter((participant) => participant.id !== userData.id)

    if (otherParticipants.length === 0) return "การสนทนาส่วนตัว"

    return otherParticipants.map((participant) => participant.fullName).join(", ")
  }

  const getParticipantRole = (conversation, participantId) => {
    if (!conversation) return ""

    const participant = conversation.participants.find((p) => p.id === participantId)
    return participant?.role === "LANDLORD" ? "ผู้ดูแลหอพัก" : ""
  }

  // แสดงผู้ที่กำลังพิมพ์
  const renderTypingIndicator = () => {
    if (!selectedConversation) return null

    const typingParticipants = Object.entries(typingUsers)
      .filter(([userId]) => {
        // กรองเฉพาะผู้ใช้ที่อยู่ในการสนทนานี้และไม่ใช่ตัวเอง
        return userId !== userData?.id && selectedConversation.participants.some((p) => p.id === userId)
      })
      .map(([_, data]) => data.fullName)

    if (typingParticipants.length === 0) return null

    return (
      <div className="text-xs text-gray-500 italic p-2">
        {typingParticipants.length === 1
          ? `${typingParticipants[0]} กำลังพิมพ์...`
          : `${typingParticipants.join(", ")} กำลังพิมพ์...`}
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: "calc(100vh - 120px)" }}>
          <div className="flex h-full">
            {/* รายการสนทนา (แสดงบนมือถือเมื่อกดปุ่มเมนู) */}
            <div
              className={`${
                isMobileMenuOpen ? "block" : "hidden"
              } md:block w-full md:w-1/3 bg-gray-50 border-r border-gray-200 h-full`}
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold">การสนทนา</h2>
                <div className="flex items-center">
                  {totalUnread > 0 && (
                    <div className="mr-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      {totalUnread > 99 ? "99+" : totalUnread}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setShowUserList(true)
                      fetchUsers()
                    }}
                    className="p-2 rounded-full hover:bg-gray-200"
                    title="เริ่มการสนทนาใหม่"
                  >
                    <PlusCircle className="h-6 w-6 text-blue-500" />
                  </button>
                </div>
              </div>

              {/* รายการสนทนา */}
              <div className="overflow-y-auto" style={{ height: "calc(100% - 65px)" }}>
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">{isLoading ? "กำลังโหลดข้อมูล..." : "ไม่มีการสนทนา"}</div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${
                        selectedConversation?.id === conversation.id ? "bg-blue-50" : ""
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-grow">
                          <h3 className="font-medium">{getConversationName(conversation)}</h3>
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage
                              ? `${
                                  conversation.lastMessage.senderId === userData?.id ? "คุณ: " : ""
                                }${conversation.lastMessage.content}`
                              : "ไม่มีข้อความ"}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="text-xs text-gray-400">
                            {conversation.lastMessage ? formatTime(conversation.lastMessage.createdAt) : ""}
                          </div>
                          {unreadCounts[conversation.id] > 0 && (
                            <div className="mt-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                              {unreadCounts[conversation.id] > 9 ? "9+" : unreadCounts[conversation.id]}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ส่วนแสดงข้อความ */}
            <div className={`${isMobileMenuOpen ? "hidden" : "block"} md:block w-full md:w-2/3 flex flex-col h-full`}>
              {selectedConversation ? (
                <>
                  {/* ส่วนหัวของการสนทนา */}
                  <div className="p-4 border-b border-gray-200 flex items-center">
                    <button
                      className="md:hidden mr-2 p-1 rounded-full hover:bg-gray-200"
                      onClick={() => setIsMobileMenuOpen(true)}
                    >
                      <Menu className="h-6 w-6" />
                    </button>
                    <div className="flex-grow">
                      <h2 className="text-lg font-semibold">{getConversationName(selectedConversation)}</h2>
                      <p className="text-sm text-gray-500">{selectedConversation.participants.length} คน</p>
                    </div>
                    <div className="flex items-center">
                      {!isConnected && (
                        <div className="mr-2 text-xs text-red-500 bg-red-50 px-2 py-1 rounded">ออฟไลน์</div>
                      )}
                      <button
                        className="p-2 rounded-full hover:bg-gray-200"
                        onClick={() => fetchMessages(selectedConversation.id)}
                        title="รีเฟรช"
                      >
                        <RefreshCw className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* ส่วนแสดงข้อความ */}
                  <div className="flex-grow overflow-y-auto p-4" style={{ height: "calc(100% - 140px)" }}>
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        เริ่มการสนทนาโดยส่งข้อความ
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((message, index) => {
                          const isCurrentUser = message.sender.id === userData?.id
                          const showDate =
                            index === 0 ||
                            new Date(message.createdAt).toDateString() !==
                              new Date(messages[index - 1].createdAt).toDateString()

                          return (
                            <div key={message.id}>
                              {showDate && (
                                <div className="text-center my-4">
                                  <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                                    {formatDate(message.createdAt)}
                                  </span>
                                </div>
                              )}
                              <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                                <div
                                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                    isCurrentUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                                  }`}
                                >
                                  {!isCurrentUser && (
                                    <div className="text-xs font-medium mb-1">
                                      {message.sender.fullName}
                                      {getParticipantRole(selectedConversation, message.sender.id) && (
                                        <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 rounded">
                                          {getParticipantRole(selectedConversation, message.sender.id)}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  <p>{message.content}</p>
                                  <div className={`text-xs mt-1 ${isCurrentUser ? "text-blue-100" : "text-gray-500"}`}>
                                    {formatTime(message.createdAt)}
                                    {isCurrentUser && (
                                      <span className="ml-2">{message.isRead ? "อ่านแล้ว" : "ส่งแล้ว"}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* แสดงผู้ที่กำลังพิมพ์ */}
                  {renderTypingIndicator()}

                  {/* ส่วนส่งข้อความ */}
                  <div className="p-4 border-t border-gray-200">
                    <form onSubmit={sendMessage} className="flex items-center">
                      <input
                        type="text"
                        className="flex-grow border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="พิมพ์ข้อความ..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key !== "Enter") {
                            handleTyping()
                          }
                        }}
                        ref={messageInputRef}
                        disabled={!isConnected}
                      />
                      <button
                        type="submit"
                        className="bg-blue-500 text-white rounded-r-lg px-4 py-2 hover:bg-blue-600 disabled:bg-gray-400"
                        disabled={!newMessage.trim() || !isConnected}
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 flex-col">
                  <Users className="h-16 w-16 mb-4 text-gray-300" />
                  <p className="mb-2">เลือกการสนทนาหรือเริ่มการสนทนาใหม่</p>
                  <button
                    onClick={() => {
                      setShowUserList(true)
                      fetchUsers()
                      setIsMobileMenuOpen(false)
                    }}
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    เริ่มการสนทนาใหม่
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal สำหรับแสดงรายชื่อผู้ใช้ */}
      {showUserList && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-10 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">เริ่มการสนทนาใหม่</h2>
              <button onClick={() => setShowUserList(false)} className="p-1 rounded-full hover:bg-gray-200">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <div className="relative mb-4">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2"
                  placeholder="ค้นหาผู้ใช้..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      fetchUsers()
                    }
                  }}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <button className="absolute right-3 top-2.5 text-blue-500 hover:text-blue-700" onClick={fetchUsers}>
                  ค้นหา
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {users.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">ไม่พบผู้ใช้</div>
                ) : (
                  users.map((user) => (
                    <div
                      key={user.id}
                      className="p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 flex items-center"
                      onClick={() => startNewConversation(user.id)}
                    >
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium">{user.fullName}</h3>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                      </div>
                      {user.role === "LANDLORD" && (
                        <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">ผู้ดูแลหอพัก</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

