import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma"
import { auth } from "@/lib/auth"

// Initialize Prisma client
const prisma = new PrismaClient()

// GET endpoint to fetch document categories
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Fetch categories with document count
    const categories = await prisma.documentCategory.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
    })
    
    // Transform result to include document count
    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color,
      documentCount: category._count.documents,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }))
    
    return NextResponse.json(transformedCategories)
  } catch (error) {
    console.error("Error fetching document categories:", error)
    return NextResponse.json({ error: "Failed to fetch document categories" }, { status: 500 })
  }
}

// POST endpoint to create a new document category
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Check if user has admin privileges
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "You don't have permission to create document categories" },
        { status: 403 }
      )
    }
    
    const data = await req.json()
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      )
    }
    
    // Check if category with the same name already exists
    const existingCategory = await prisma.documentCategory.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: "insensitive",
        },
      },
    })
    
    if (existingCategory) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      )
    }
    
    // Create new category
    const category = await prisma.documentCategory.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color || "#4f46e5",
      },
    })
    
    return NextResponse.json({
      ...category,
      documentCount: 0,
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating document category:", error)
    return NextResponse.json({ error: "Failed to create document category" }, { status: 500 })
  }
}

// PATCH endpoint to update a document category
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Check if user has admin privileges
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "You don't have permission to update document categories" },
        { status: 403 }
      )
    }
    
    const data = await req.json()
    
    // Validate required fields
    if (!data.id || !data.name) {
      return NextResponse.json(
        { error: "Category ID and name are required" },
        { status: 400 }
      )
    }
    
    // Check if category exists
    const existingCategory = await prisma.documentCategory.findUnique({
      where: { id: data.id },
    })
    
    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }
    
    // Check for name conflicts if the name is changing
    if (data.name !== existingCategory.name) {
      const nameConflict = await prisma.documentCategory.findFirst({
        where: {
          name: {
            equals: data.name,
            mode: "insensitive",
          },
          id: {
            not: data.id,
          },
        },
      })
      
      if (nameConflict) {
        return NextResponse.json(
          { error: "A category with this name already exists" },
          { status: 409 }
        )
      }
    }
    
    // Update category
    const updatedCategory = await prisma.documentCategory.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
      },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
    })
    
    return NextResponse.json({
      id: updatedCategory.id,
      name: updatedCategory.name,
      description: updatedCategory.description,
      color: updatedCategory.color,
      documentCount: updatedCategory._count.documents,
      createdAt: updatedCategory.createdAt,
      updatedAt: updatedCategory.updatedAt,
    })
  } catch (error) {
    console.error("Error updating document category:", error)
    return NextResponse.json({ error: "Failed to update document category" }, { status: 500 })
  }
}

// DELETE endpoint to delete a document category
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Check if user has admin privileges
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "You don't have permission to delete document categories" },
        { status: 403 }
      )
    }
    
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 })
    }
    
    // Check if category exists
    const existingCategory = await prisma.documentCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
    })
    
    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }
    
    // Check if category has documents
    if (existingCategory._count.documents > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete category with documents", 
          documentCount: existingCategory._count.documents 
        },
        { status: 400 }
      )
    }
    
    // Delete category
    await prisma.documentCategory.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting document category:", error)
    return NextResponse.json({ error: "Failed to delete document category" }, { status: 500 })
  }
} 