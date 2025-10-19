import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function POST(request: NextRequest) {
  try {
    const { email, password, companyCode } = await request.json();

    if (!email || !password || !companyCode) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate company code
    const company = await prisma.company.findFirst({
      where: { 
        code: companyCode,
        isActive: true
      }
    });

    if (!company) {
      return NextResponse.json(
        { error: "Invalid company code" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Validate email domain matches company
    const emailDomain = email.split('@')[1];
    if (company.emailDomain && emailDomain !== company.emailDomain) {
      return NextResponse.json(
        { error: `Please use your ${company.emailDomain} email address` },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if this is the first user in the company (should be admin)
    const userCount = await prisma.user.count({
      where: { companyId: company.id }
    });
    
    const isFirstUser = userCount === 0;
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: email.split('@')[0], // Default name from email
        companyId: company.id,
        isInternal: true,
        role: isFirstUser ? 'ADMIN' : 'USER', // First user becomes admin
        lastLogin: new Date()
      }
    });

    // Create JWT token with role
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        companyId: user.companyId,
        isInternal: true,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company
      },
      token
    });

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Signup failed" },
      { status: 500 }
    );
  }
}
