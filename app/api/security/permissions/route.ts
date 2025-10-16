import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'

// Get role permissions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') as UserRole

    if (role) {
      // Get permissions for specific role
      const rolePermissions = await prisma.rolePermission.findMany({
        where: { roleId: role },
        include: {
          permission: true
        }
      })

      const permissions = rolePermissions.map(rp => ({
        id: rp.permission.id,
        name: rp.permission.name,
        description: rp.permission.description,
        category: rp.permission.category,
        resource: rp.permission.resource,
        action: rp.permission.action,
        granted: rp.granted
      }))

      return NextResponse.json({ role, permissions })
    } else {
      // Get all permissions grouped by category
      const allPermissions = await prisma.permission.findMany({
        orderBy: [
          { category: 'asc' },
          { name: 'asc' }
        ]
      })

      const groupedPermissions = allPermissions.reduce((acc, permission) => {
        if (!acc[permission.category]) {
          acc[permission.category] = []
        }
        acc[permission.category].push(permission)
        return acc
      }, {} as Record<string, typeof allPermissions>)

      return NextResponse.json({ permissions: groupedPermissions })
    }

  } catch (error) {
    console.error('Get permissions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    )
  }
}

// Update role permissions (Super Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only Super Admin can modify permissions
    if (session.user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { role, permissionId, granted } = body

    // Update or create role permission
    const rolePermission = await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: role,
          permissionId
        }
      },
      update: {
        granted,
        grantedById: session.user.id
      },
      create: {
        roleId: role,
        permissionId,
        granted,
        grantedById: session.user.id
      }
    })

    // Log the permission change
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PERMISSION_CHANGE',
        resource: 'role_permissions',
        resourceId: rolePermission.id,
        newValues: {
          role,
          permissionId,
          granted
        },
        riskLevel: 'HIGH'
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Update permissions error:', error)
    return NextResponse.json(
      { error: 'Failed to update permissions' },
      { status: 500 }
    )
  }
}