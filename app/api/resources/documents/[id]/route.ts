import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma"
import { auth } from "@/lib/auth"

const prisma = new PrismaClient()

// GET - Get a single document by ID
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
    
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            name: true,
            color: true,
          },
        },
        uploadedBy: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }
    
    // Check permissions if document is not public
    if (!document.isPublic) {
      // Admin and owner can access any document
      if (session.user.role !== "ADMIN" && document.uploadedById !== session.user.id) {
        // For non-admins and non-owners, check access level
        if (document.accessLevel === "ADMIN_ONLY") {
          return NextResponse.json({ error: "You don't have permission to view this document" }, { status: 403 })
        }
        
        if (document.accessLevel === "STAFF_ONLY" && session.user.role === "VOLUNTEER") {
          return NextResponse.json({ error: "You don't have permission to view this document" }, { status: 403 })
        }
      }
    }
    
    return NextResponse.json(document)
  } catch (error) {
    console.error("Error fetching document:", error)
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 })
  }
}

// PATCH - Update a document
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { id } = await context.params
    const data = await request.json()
    
    // Fetch document to verify ownership
    const existingDocument = await prisma.document.findUnique({
      where: { id },
      select: { uploadedById: true },
    })
    
    if (!existingDocument) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }
    
    // Check if user is the owner or an admin
    if (existingDocument.uploadedById !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You don't have permission to update this document" },
        { status: 403 }
      )
    }
    
    // Update the document
    const document = await prisma.document.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        projectId: data.projectId,
        accessLevel: data.accessLevel,
        isPublic: data.isPublic,
        tags: data.tags,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        uploadedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        project: {
          select: {
            name: true,
          },
        },
      },
    })
    
    return NextResponse.json(document)
  } catch (error) {
    console.error("Error updating document:", error)
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 })
  }
}

// DELETE - Delete a document
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { id } = await context.params
    
    // Fetch document to verify ownership
    const existingDocument = await prisma.document.findUnique({
      where: { id },
      select: { uploadedById: true, fileUrl: true },
    })
    
    if (!existingDocument) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }
    
    // Check if user is the owner or an admin
    if (existingDocument.uploadedById !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You don't have permission to delete this document" },
        { status: 403 }
      )
    }
    
    // In a real app, you would also delete the file from storage
    // await deleteFileFromStorage(existingDocument.fileUrl)
    
    // Delete the document
    await prisma.document.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
  }
} 