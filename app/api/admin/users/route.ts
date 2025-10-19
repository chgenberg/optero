import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/middleware/role-guard";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get all users in the same company
    const users = await prisma.user.findMany({
      where: {
        companyId: user.companyId,
        isInternal: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isInternal: true,
        lastLogin: true,
        createdAt: true,
        permissions: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
