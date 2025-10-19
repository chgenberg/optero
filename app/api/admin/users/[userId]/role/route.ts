import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/middleware/role-guard";
import { canChangeRole } from "@/lib/rbac";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const currentUser = getUserFromRequest(request);
    
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { role } = await request.json();
    const userId = params.userId;

    // Validate role
    if (!['ADMIN', 'USER', 'VIEWER'].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if in same company
    if (targetUser.companyId !== currentUser.companyId) {
      return NextResponse.json(
        { error: "Cannot modify users from other companies" },
        { status: 403 }
      );
    }

    // Validate role change permission
    if (!canChangeRole(currentUser.role as any, targetUser.role as any, role)) {
      return NextResponse.json(
        { error: "Insufficient permissions to change this role" },
        { status: 403 }
      );
    }

    // Prevent removing last admin
    if (targetUser.role === 'ADMIN' && role !== 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: {
          companyId: currentUser.companyId,
          role: 'ADMIN'
        }
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot remove the last admin" },
          { status: 400 }
        );
      }
    }

    // Update role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}
