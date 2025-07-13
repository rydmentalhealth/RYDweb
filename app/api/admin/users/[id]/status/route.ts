import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { UserStatus } from "@/lib/generated/prisma";

interface RouteParams {
  params: Promise<{ id: string }>
}

// PATCH - Update user status (approve/reject/suspend)
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user is an admin or super admin
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }
    
    const { id } = await params;
    const data = await req.json();
    
    // Validate status
    const validStatuses = ['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'REJECTED'];
    if (!data.status || !validStatuses.includes(data.status)) {
      return NextResponse.json({ 
        error: "Invalid status. Must be one of: " + validStatuses.join(', ') 
      }, { status: 400 });
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, status: true, role: true }
    });
    
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Prevent self-modification of status
    if (existingUser.id === session.user.id) {
      return NextResponse.json({ 
        error: "You cannot modify your own status" 
      }, { status: 400 });
    }
    
    // Prevent modification of other admins (unless you're SUPER_ADMIN)
    if (existingUser.role === 'ADMIN' || existingUser.role === 'SUPER_ADMIN') {
      if (session.user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ 
          error: "Only super admins can modify other admin accounts" 
        }, { status: 403 });
      }
    }
    
    // Update user status
    const updateData: any = {
      status: data.status as UserStatus,
    };
    
    // Set approval data when approving
    if (data.status === 'ACTIVE' && existingUser.status === 'PENDING') {
      updateData.approvedAt = new Date();
      updateData.approvedById = session.user.id;
    }
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        status: true,
        jobTitle: true,
        department: true,
        phone: true,
        district: true,
        region: true,
        createdAt: true,
        updatedAt: true,
        approvedAt: true,
      },
    });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json({ error: "Failed to update user status" }, { status: 500 });
  }
} 