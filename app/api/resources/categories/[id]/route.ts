import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma"
import { auth } from "@/lib/auth"

const prisma = new PrismaClient()

// GET - Get a single category by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { id } = await context.params
    
    const category = await prisma.documentCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
    })
    
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }
    
    // Transform result to include document count
    const transformedCategory = {
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color,
      documentCount: category._count.documents,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }
    
    return NextResponse.json(transformedCategory)
  } catch (error) {
    console.error("Error fetching document category:", error)
    return NextResponse.json({ error: "Failed to fetch document category" }, { status: 500 })
  }
}

// PATCH - Update a category
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await context.params
    const data = await request.json()
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      )
    }
    
    // Check if category exists
    const existingCategory = await prisma.documentCategory.findUnique({
      where: { id },
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
            not: id,
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
      where: { id },
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

// DELETE - Delete a category
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await context.params
    
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