import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

// Schema for validating POST request
const transactionSchema = z.object({
  type: z.enum(["EXPENSE", "INCOME", "DONATION", "GRANT"]),
  amount: z.number().positive(),
  date: z.coerce.date(),
  description: z.string().optional(),
  category: z.string().optional(),
  projectId: z.string().optional().nullable(),
})

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      })
    }
    
    // Get query parameters
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const projectId = searchParams.get("projectId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    
    // Build the where clause based on filters
    const where: any = {}
    
    if (type) {
      where.type = type
    }
    
    if (projectId) {
      where.projectId = projectId
    }
    
    if (startDate || endDate) {
      where.date = {}
      
      if (startDate) {
        where.date.gte = new Date(startDate)
      }
      
      if (endDate) {
        where.date.lte = new Date(endDate)
      }
    }
    
    // Access the model using shared Prisma client
    const transactions = await prisma.financialTransaction.findMany({
      where,
      orderBy: {
        date: "desc",
      },
      include: {
        project: {
          select: {
            name: true,
          },
        },
      },
    })
    
    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to fetch transactions" }), {
      status: 500,
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      })
    }
    
    // Parse and validate request body
    const body = await req.json()
    const validatedData = transactionSchema.parse(body)
    
    // Access the model using shared Prisma client
    const transaction = await prisma.financialTransaction.create({
      data: {
        type: validatedData.type,
        amount: validatedData.amount,
        date: validatedData.date,
        description: validatedData.description,
        category: validatedData.category,
        projectId: validatedData.projectId || undefined,
      },
    })
    
    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error("Error creating transaction:", error)
    
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: "Validation error", details: error.errors }), {
        status: 400,
      })
    }
    
    return new NextResponse(JSON.stringify({ error: "Failed to create transaction" }), {
      status: 500,
    })
  }
} 