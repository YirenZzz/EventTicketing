// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();

    // 1) 校验参数
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const validRoles = ["Organizer", "Staff", "Attendee"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // 2) 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // 3) 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4) 创建新用户
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role, // 注意这里传的是首字母大写字符串
      },
    });

    // 5) 成功响应
    return NextResponse.json(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("User registration failed:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}