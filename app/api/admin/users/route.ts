import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, UserRole, UserStatus } from "@/lib/generated/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { hashPassword } from "@/lib/server/bcrypt";
import { prisma } from "@/lib/db";

const prismaClient = new PrismaClient();

// Schema for creating users by admin
const createUserSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["VOLUNTEER", "STAFF", "ADMIN", "SUPER_ADMIN"]),
  phone: z.string().optional(),
  district: z.string().optional(),
  region: z.string().optional(),
  skills: z.string().optional(),
  languages: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
});

// GET - Fetch all users (Admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user is an admin or super admin
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }
    
    const users = await prisma.user.findMany({
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
      orderBy: [
        { status: 'asc' }, // Show pending first
        { createdAt: 'desc' }
      ]
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST - Create a new user
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user is an admin or super admin
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }
    
    const data = await req.json();
    
    // Validate the data
    const validatedData = createUserSchema.parse(data);
    
    // Check if email already exists
    const existingUser = await prismaClient.user.findUnique({
      where: {
        email: validatedData.email
      },
    });
    
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
    
    // Hash the password
    const hashedPassword = await hashPassword(validatedData.password);
    
    // Create user with unified model
    const user = await prismaClient.user.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        name: `${validatedData.firstName} ${validatedData.lastName}`,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role as UserRole,
        status: UserStatus.ACTIVE, // Admin-created users are immediately active
        approvedAt: new Date(),
        approvedById: session.user.id,
        phone: validatedData.phone,
        district: validatedData.district,
        region: validatedData.region,
        skills: validatedData.skills,
        languages: validatedData.languages,
        jobTitle: validatedData.jobTitle,
        department: validatedData.department,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        role: true,
        status: true,
        jobTitle: true,
        department: true,
        createdAt: true,
      },
    });
    
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 });
    }
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
} 