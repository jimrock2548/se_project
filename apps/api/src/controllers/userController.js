const bcrypt = require('bcrypt');
const prisma = require('../services/prisma');

// ลงทะเบียนผู้ใช้ใหม่
const register = async (req, res) => {
  try {
    const { username, email, fullName, phone, role, roomId, checkInDate } = req.body;

    // สร้างรหัสผ่านชั่วคราวแบบสุ่ม
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // ตรวจสอบว่า username และ email ไม่ซ้ำกับที่มีอยู่แล้ว
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Username or email already exists" });
    }

    // เริ่ม transaction เพื่อสร้างผู้ใช้และข้อมูลที่เกี่ยวข้อง
    const result = await prisma.$transaction(async (tx) => {
      // สร้างผู้ใช้ใหม่
      const newUser = await tx.user.create({
        data: {
          username,
          password: hashedPassword,
          email,
          fullName,
          phone,
          role,
        },
      });

      // ถ้าเป็น RESIDENT ให้สร้างข้อมูล Resident ด้วย
      if (role === "RESIDENT" && roomId) {
        await tx.resident.create({
          data: {
            userId: newUser.id,
            roomId,
            checkInDate: new Date(checkInDate),
            isActive: true,
          },
        });
      }

      // ถ้าเป็น LANDLORD ให้สร้างข้อมูล Landlord ด้วย
      if (role === "LANDLORD") {
        await tx.landlord.create({
          data: {
            userId: newUser.id,
          },
        });
      }

      return { newUser, tempPassword };
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: result.newUser.id,
        username: result.newUser.username,
        email: result.newUser.email,
        role: result.newUser.role,
      },
      tempPassword: result.tempPassword, // ส่งรหัสผ่านชั่วคราวกลับไปให้เจ้าของหอพัก
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
};

// เปลี่ยนรหัสผ่าน
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // ตรวจสอบว่ามีการส่งรหัสผ่านมาครบถ้วน
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required" });
    }

    // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ตรวจสอบรหัสผ่านปัจจุบัน
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // เข้ารหัสรหัสผ่านใหม่
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // อัปเดตรหัสผ่านในฐานข้อมูล
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
};

// อัปเดตข้อมูลส่วนตัว
const updateProfile = async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    const userId = req.user.id;

    // ตรวจสอบว่ามีการส่งข้อมูลมาอย่างน้อยหนึ่งฟิลด์
    if (!fullName && !email && !phone) {
      return res.status(400).json({ error: "At least one field must be provided for update" });
    }

    // สร้างออบเจ็กต์สำหรับอัปเดตข้อมูล
    const updateData = {};

    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;

    // ถ้ามีการอัปเดตอีเมล ต้องตรวจสอบว่าไม่ซ้ำกับผู้ใช้อื่น
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: userId },
        },
      });

      if (existingUser) {
        return res.status(400).json({ error: "Email already in use by another user" });
      }

      updateData.email = email;
    }

    // อัปเดตข้อมูลผู้ใช้
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
      },
    });

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

module.exports = {
  register,
  changePassword,
  updateProfile
};