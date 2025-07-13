import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma"
import { auth } from "@/lib/auth"

// Initialize Prisma client
const prisma = new PrismaClient()

// GET endpoint to fetch documents
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Get search parameters
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get("categoryId")
    const projectId = searchParams.get("projectId")
    const search = searchParams.get("search")
    
    // Build filter object
    const filter: any = {}
    
    if (categoryId) {
      filter.categoryId = categoryId
    }
    
    if (projectId) {
      filter.projectId = projectId
    }
    
    if (search) {
      filter.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { fileName: { contains: search, mode: "insensitive" } },
        { tags: { contains: search, mode: "insensitive" } },
      ]
    }
    
    // Fetch documents
    const documents = await prisma.document.findMany({
      where: filter,
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
      orderBy: {
        createdAt: "desc",
      },
    })
    
    return NextResponse.json(documents)
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}

// POST endpoint to create a new document
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // This would be handled via FormData for file uploads
    // For simplicity, let's assume the frontend sends the file URL after uploading to storage
    const data = await req.json()
    
    // Ensure required fields are present
    if (!data.title || !data.fileName || !data.fileUrl || !data.fileType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    // Create the document record
    const document = await prisma.document.create({
      data: {
        title: data.title,
        description: data.description,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: data.fileSize,
        categoryId: data.categoryId,
        uploadedById: session.user.id,
        projectId: data.projectId || null,
        accessLevel: data.accessLevel || "ALL_STAFF",
        isPublic: data.isPublic || false,
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
    
    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error("Error creating document:", error)
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 })
  }
}

// PATCH endpoint to update a document
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const data = await req.json()
    
    if (!data.id) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }
    
    // Fetch document to verify ownership
    const existingDocument = await prisma.document.findUnique({
      where: { id: data.id },
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
      where: { id: data.id },
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

// DELETE endpoint to delete a document
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }
    
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