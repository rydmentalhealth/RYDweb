import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, UserRole, UserStatus } from "@/lib/generated/prisma";
import { z } from "zod";
import { hashPassword } from "@/lib/server/bcrypt";

const prisma = new PrismaClient();

// Input validation schema
const userSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate input
    const result = userSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: result.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password using our server-side utility
    const hashedPassword = await hashPassword(password);

    // Split name into first and last name
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    // Create user with unified model (PENDING status requires admin approval)
    const user = await prisma.user.create({
        data: {
        firstName,
        lastName,
          name,
          email,
          password: hashedPassword,
          role: UserRole.VOLUNTEER, // Default role for new users
        status: UserStatus.PENDING, // Requires admin approval
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        message: "Account created successfully. Please wait for admin approval.", 
        user: userWithoutPassword 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Error creating user" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 