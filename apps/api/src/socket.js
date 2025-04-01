const { Server } = require("socket.io")
const jwt = require("jsonwebtoken")
const prisma = require("./config/prisma")

let io

function initializeSocket(server) {
  try {
    console.log("Initializing Socket.io server...")

    io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
      },
      transports: ["polling", "websocket"],
    })

    // Middleware สำหรับตรวจสอบการยืนยันตัวตน
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token

        if (!token) {
          console.log("Socket connection rejected: No token provided")
          return next(new Error("Authentication error: Token not provided"))
        }

        // ตรวจสอบ token
        const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

        const decoded = jwt.verify(token, JWT_SECRET)
        console.log("Socket auth successful for user ID:", decoded.userId)

        // ดึงข้อมูลผู้ใช้
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
        })

        if (!user) {
          console.log("Socket connection rejected: User not found")
          return next(new Error("Authentication error: User not found"))
        }

        // เก็บข้อมูลผู้ใช้ไว้ใน socket
        socket.user = {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
        }

        next()
      } catch (error) {
        console.error("Socket authentication error:", error.message)
        next(new Error(`Authentication error: ${error.message}`))
      }
    })

    // จัดการการเชื่อมต่อ
    io.on("connection", (socket) => {
      console.log(`User connected: ${socket.user.fullName} (${socket.user.id})`)

      // เข้าร่วมห้องสนทนาส่วนตัว
      socket.join(socket.user.id)

      // รับฟังเหตุการณ์เมื่อผู้ใช้เข้าร่วมการสนทนา
      socket.on("join-conversation", (conversationId) => {
        socket.join(conversationId)
        console.log(`${socket.user.fullName} joined conversation: ${conversationId}`)
      })

      // รับฟังเหตุการณ์เมื่อผู้ใช้ออกจากการสนทนา
      socket.on("leave-conversation", (conversationId) => {
        socket.leave(conversationId)
        console.log(`${socket.user.fullName} left conversation: ${conversationId}`)
      })

      // รับฟังเหตุการณ์เมื่อผู้ใช้ส่งข้อความ
      socket.on("send-message", async (data) => {
        try {
          const { conversationId, content } = data

          // ตรวจสอบว่าผู้ใช้เป็นส่วนหนึ่งของการสนทนานี้หรือไม่
          const participant = await prisma.participant.findFirst({
            where: {
              conversationId,
              userId: socket.user.id,
            },
          })

          if (!participant) {
            socket.emit("error", { message: "You are not a participant in this conversation" })
            return
          }

          // บันทึกข้อความลงในฐานข้อมูล
          const message = await prisma.message.create({
            data: {
              content,
              senderId: socket.user.id,
              conversationId,
            },
            include: {
              sender: {
                select: {
                  id: true,
                  fullName: true,
                  username: true,
                },
              },
            },
          })

          // อัปเดตเวลาล่าสุดของการสนทนา
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
          })

          // ส่งข้อความไปยังทุกคนในการสนทนา
          io.to(conversationId).emit("new-message", message)

          // ส่งการแจ้งเตือนไปยังผู้เข้าร่วมคนอื่นๆ
          const participants = await prisma.participant.findMany({
            where: {
              conversationId,
              userId: {
                not: socket.user.id,
              },
            },
            select: {
              userId: true,
            },
          })

          // ส่งการแจ้งเตือนไปยังผู้เข้าร่วมแต่ละคน
          participants.forEach((participant) => {
            io.to(participant.userId).emit("notification", {
              type: "new-message",
              conversationId,
              message: {
                id: message.id,
                content: message.content,
                senderId: message.senderId,
                senderName: message.sender.fullName,
                createdAt: message.createdAt,
              },
            })
          })
        } catch (error) {
          console.error("Error sending message:", error)
          socket.emit("error", { message: "Failed to send message" })
        }
      })

      // รับฟังเหตุการณ์เมื่อผู้ใช้กำลังพิมพ์
      socket.on("typing", (conversationId) => {
        // ส่งสถานะการพิมพ์ไปยังผู้ใช้คนอื่นในการสนทนา
        socket.to(conversationId).emit("user-typing", {
          userId: socket.user.id,
          fullName: socket.user.fullName,
        })
      })

      // รับฟังเหตุการณ์เมื่อผู้ใช้หยุดพิมพ์
      socket.on("stop-typing", (conversationId) => {
        socket.to(conversationId).emit("user-stop-typing", {
          userId: socket.user.id,
        })
      })

      // รับฟังเหตุการณ์เมื่อผู้ใช้อ่านข้อความ
      socket.on("mark-as-read", async (messageId) => {
        try {
          // อัปเดตสถานะการอ่านข้อความ
          const message = await prisma.message.update({
            where: { id: messageId },
            data: { isRead: true },
            include: {
              conversation: {
                select: {
                  id: true,
                },
              },
            },
          })

          // แจ้งผู้ส่งว่าข้อความถูกอ่านแล้ว
          io.to(message.senderId).emit("message-read", {
            messageId,
            conversationId: message.conversation.id,
            readBy: socket.user.id,
          })
        } catch (error) {
          console.error("Error marking message as read:", error)
        }
      })

      // รับฟังเหตุการณ์เมื่อผู้ใช้ตัดการเชื่อมต่อ
      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.user.fullName} (${socket.user.id})`)
      })
    })

    console.log("Socket.io server initialized successfully")
    return io
  } catch (error) {
    console.error("Error initializing Socket.io:", error)
    throw error
  }
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized")
  }
  return io
}

module.exports = {
  initializeSocket,
  getIO,
}

