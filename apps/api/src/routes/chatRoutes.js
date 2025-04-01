const express = require("express")
const router = express.Router()
const prisma = require("../config/prisma")
const authMiddleware = require("../middleware/auth")

// ตรวจสอบว่าไฟล์ socket.js มีอยู่จริงและสามารถ import ได้
let socketModule
try {
  socketModule = require("../socket")
  console.log("Socket module loaded successfully")
} catch (error) {
  console.error("Error loading socket module:", error.message)
  // สร้าง mock function เพื่อป้องกันการเกิด error
  socketModule = {
    getIO: () => {
      console.warn("Socket.io not available, using mock implementation")
      return {
        to: () => ({
          emit: () => console.log("Mock socket emit called"),
        }),
        emit: () => console.log("Mock socket emit called"),
      }
    },
  }
}

// ใช้ getIO function จาก socketModule
const getIO = socketModule.getIO

// Get all conversations for the current user
router.get("/conversations", authMiddleware.authenticate, async (req, res) => {
  try {
    const { userId, role } = req.user

    let conversations = []

    if (role === "LANDLORD") {
      // Landlord can see all conversations
      conversations = await prisma.conversation.findMany({
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  username: true,
                  role: true,
                },
              },
            },
          },
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      })
    } else {
      // Resident can only see their own conversations
      conversations = await prisma.conversation.findMany({
        where: {
          participants: {
            some: {
              userId: userId,
            },
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  username: true,
                  role: true,
                },
              },
            },
          },
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      })
    }

    // Format conversations for the client
    const formattedConversations = conversations.map((conversation) => {
      // Filter out the current user from participants
      const otherParticipants = conversation.participants.filter((participant) => participant.userId !== userId)

      // Get the last message
      const lastMessage = conversation.messages[0] || null

      return {
        id: conversation.id,
        name: conversation.name || otherParticipants.map((p) => p.user.fullName).join(", "),
        participants: conversation.participants.map((p) => ({
          id: p.userId,
          fullName: p.user.fullName,
          username: p.user.username,
          role: p.user.role,
        })),
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              senderId: lastMessage.senderId,
              createdAt: lastMessage.createdAt,
            }
          : null,
        updatedAt: conversation.updatedAt,
        isGroup: conversation.isGroup,
      }
    })

    return res.status(200).json({ conversations: formattedConversations })
  } catch (error) {
    console.error("Get conversations error:", error)
    return res.status(500).json({ error: "Internal server error", details: error.message })
  }
})

// Get messages for a specific conversation
router.get("/conversations/:id/messages", authMiddleware.authenticate, async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.user
    const { limit = 50, before } = req.query

    // Check if the user is a participant in this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
              },
            },
          },
        },
      },
    })

    if (!conversation) {
      return res.status(403).json({ error: "You don't have access to this conversation" })
    }

    // Build the query
    const whereClause = {
      conversationId: id,
    }

    // Add pagination if 'before' is provided
    if (before) {
      whereClause.createdAt = {
        lt: new Date(before),
      }
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      take: Number.parseInt(limit),
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

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: {
          not: userId,
        },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    return res.status(200).json({
      conversation: {
        id: conversation.id,
        name: conversation.name,
        participants: conversation.participants.map((p) => ({
          id: p.userId,
          fullName: p.user.fullName,
          username: p.user.username,
        })),
        isGroup: conversation.isGroup,
      },
      messages: messages.reverse(), // Return in chronological order
    })
  } catch (error) {
    console.error("Get messages error:", error)
    return res.status(500).json({ error: "Internal server error", details: error.message })
  }
})

// Send a message
router.post("/conversations/:id/messages", authMiddleware.authenticate, async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.user
    const { content } = req.body

    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Message content is required" })
    }

    // Check if the user is a participant in this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!conversation) {
      return res.status(403).json({ error: "You don't have access to this conversation" })
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        conversation: {
          connect: { id },
        },
        sender: {
          connect: { id: userId },
        },
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

    // Update conversation's updatedAt
    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    })

    // ส่งข้อความแบบเรียลไทม์ผ่าน Socket.io
    try {
      const io = getIO()

      // ส่งข้อความไปยังทุกคนในการสนทนา
      io.to(id).emit("new-message", message)

      // ส่งการแจ้งเตือนไปยังผู้เข้าร่วมคนอื่นๆ
      conversation.participants.forEach((participant) => {
        if (participant.userId !== userId) {
          io.to(participant.userId).emit("notification", {
            type: "new-message",
            conversationId: id,
            message: {
              id: message.id,
              content: message.content,
              senderId: message.senderId,
              senderName: message.sender.fullName,
              createdAt: message.createdAt,
            },
          })
        }
      })
    } catch (socketError) {
      console.error("Socket.io error:", socketError)
      // ไม่ต้องส่งข้อผิดพลาดกลับไปยังผู้ใช้ เพราะข้อความยังถูกบันทึกในฐานข้อมูล
    }

    return res.status(201).json({ message })
  } catch (error) {
    console.error("Send message error:", error)
    return res.status(500).json({ error: "Internal server error", details: error.message })
  }
})

// แก้ไขฟังก์ชัน createConversation ให้ไม่รองรับการสร้างกลุ่มแชท
router.post("/conversations", authMiddleware.authenticate, async (req, res) => {
  try {
    const { userId } = req.user
    const { participantIds } = req.body

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({ error: "At least one participant is required" })
    }

    // Add the current user to participants if not already included
    if (!participantIds.includes(userId)) {
      participantIds.push(userId)
    }

    // Check if all participants exist
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: participantIds,
        },
      },
    })

    if (users.length !== participantIds.length) {
      return res.status(400).json({ error: "One or more participants do not exist" })
    }

    // For non-group chats, check if a conversation already exists between these users
    if (participantIds.length === 2) {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          isGroup: false,
          AND: [
            {
              participants: {
                some: {
                  userId: participantIds[0],
                },
              },
            },
            {
              participants: {
                some: {
                  userId: participantIds[1],
                },
              },
            },
          ],
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  username: true,
                },
              },
            },
          },
        },
      })

      if (existingConversation) {
        return res.status(200).json({
          message: "Conversation already exists",
          conversation: {
            id: existingConversation.id,
            name: existingConversation.name,
            participants: existingConversation.participants.map((p) => ({
              id: p.userId,
              fullName: p.user.fullName,
              username: p.user.username,
            })),
            isGroup: existingConversation.isGroup,
          },
        })
      }
    }

    // Create a new conversation (always as a non-group conversation)
    const conversation = await prisma.conversation.create({
      data: {
        name: null,
        isGroup: false,
        participants: {
          create: participantIds.map((id) => ({
            user: {
              connect: { id },
            },
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
              },
            },
          },
        },
      },
    })

    // แจ้งเตือนผู้ใช้ที่ถูกเพิ่มเข้ามาในการสนทนาผ่าน Socket.io
    try {
      const io = getIO()

      // แจ้งเตือนผู้ใช้ทุกคนที่ถูกเพิ่มเข้ามาในการสนทนา (ยกเว้นผู้สร้าง)
      participantIds.forEach((participantId) => {
        if (participantId !== userId) {
          io.to(participantId).emit("new-conversation", {
            id: conversation.id,
            name: conversation.name,
            participants: conversation.participants.map((p) => ({
              id: p.userId,
              fullName: p.user.fullName,
              username: p.user.username,
            })),
            isGroup: conversation.isGroup,
            createdBy: userId,
          })
        }
      })
    } catch (socketError) {
      console.error("Socket.io error:", socketError)
      // ไม่ต้องส่งข้อผิดพลาดกลับไปยังผู้ใช้ เพราะการสนทนายังถูกสร้างในฐานข้อมูล
    }

    return res.status(201).json({
      message: "Conversation created successfully",
      conversation: {
        id: conversation.id,
        name: conversation.name,
        participants: conversation.participants.map((p) => ({
          id: p.userId,
          fullName: p.user.fullName,
          username: p.user.username,
        })),
        isGroup: conversation.isGroup,
      },
    })
  } catch (error) {
    console.error("Create conversation error:", error)
    return res.status(500).json({ error: "Internal server error", details: error.message })
  }
})

// Get all users for starting a new conversation
router.get("/users", authMiddleware.authenticate, async (req, res) => {
  try {
    const { userId, role } = req.user
    const { search } = req.query

    let whereClause = {
      id: {
        not: userId, // Exclude the current user
      },
    }

    // Add search filter if provided
    if (search) {
      whereClause = {
        ...whereClause,
        OR: [
          {
            fullName: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            username: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }
    }

    // If the user is a resident, they can only chat with landlords and other residents
    if (role === "RESIDENT") {
      whereClause = {
        ...whereClause,
        OR: [
          { role: "LANDLORD" },
          {
            role: "RESIDENT",
          },
        ],
      }
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        fullName: true,
        username: true,
        role: true,
      },
      orderBy: {
        fullName: "asc",
      },
    })

    return res.status(200).json({ users })
  } catch (error) {
    console.error("Get users error:", error)
    return res.status(500).json({ error: "Internal server error", details: error.message })
  }
})

// เพิ่ม endpoint สำหรับการอ่านข้อความ
router.patch("/messages/:id/read", authMiddleware.authenticate, async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.user

    // ตรวจสอบว่าข้อความมีอยู่จริงหรือไม่
    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        conversation: {
          include: {
            participants: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    })

    if (!message) {
      return res.status(404).json({ error: "Message not found" })
    }

    // ตรวจสอบว่าผู้ใช้เป็นส่วนหนึ่งของการสนทนานี้หรือไม่
    const isParticipant = message.conversation.participants.some((p) => p.userId === userId)
    if (!isParticipant) {
      return res.status(403).json({ error: "You don't have access to this message" })
    }

    // ตรวจสอบว่าผู้ใช้ไม่ใช่ผู้ส่งข้อความ
    if (message.senderId === userId) {
      return res.status(400).json({ error: "You cannot mark your own message as read" })
    }

    // อัปเดตสถานะการอ่านข้อความ
    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { isRead: true },
    })

    // แจ้งผู้ส่งว่าข้อความถูกอ่านแล้วผ่าน Socket.io
    try {
      const io = getIO()
      io.to(message.senderId).emit("message-read", {
        messageId: id,
        conversationId: message.conversationId,
        readBy: userId,
      })
    } catch (socketError) {
      console.error("Socket.io error:", socketError)
    }

    return res.status(200).json({ message: "Message marked as read", messageId: id })
  } catch (error) {
    console.error("Mark message as read error:", error)
    return res.status(500).json({ error: "Internal server error", details: error.message })
  }
})

// เพิ่ม endpoint สำหรับการนับข้อความที่ยังไม่ได้อ่าน
router.get("/unread-count", authMiddleware.authenticate, async (req, res) => {
  try {
    const { userId } = req.user

    // หาการสนทนาที่ผู้ใช้เป็นส่วนหนึ่ง
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      select: {
        id: true,
      },
    })

    const conversationIds = conversations.map((c) => c.id)

    // นับจำนวนข้อความที่ยังไม่ได้อ่านในแต่ละการสนทนา
    const unreadCounts = await prisma.message.groupBy({
      by: ["conversationId"],
      where: {
        conversationId: {
          in: conversationIds,
        },
        senderId: {
          not: userId,
        },
        isRead: false,
      },
      _count: {
        id: true,
      },
    })

    // แปลงผลลัพธ์ให้อยู่ในรูปแบบที่ใช้งานง่าย
    const result = conversationIds.reduce((acc, convId) => {
      const found = unreadCounts.find((item) => item.conversationId === convId)
      acc[convId] = found ? found._count.id : 0
      return acc
    }, {})

    // คำนวณจำนวนข้อความที่ยังไม่ได้อ่านทั้งหมด
    const totalUnread = Object.values(result).reduce((sum, count) => sum + count, 0)

    return res.status(200).json({
      unreadCounts: result,
      totalUnread,
    })
  } catch (error) {
    console.error("Get unread count error:", error)
    return res.status(500).json({ error: "Internal server error", details: error.message })
  }
})

module.exports = router

