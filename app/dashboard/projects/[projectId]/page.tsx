import { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { ProjectDashboard } from "@/components/projects/project-dashboard"
import { auth } from "@/lib/auth"
import { Suspense } from "react"
import PermissionChecker from "@/components/auth/permission-checker"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"

interface ProjectPageProps {
  params: Promise<{ projectId: string }>
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { projectId } = await params
  
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { name: true, description: true }
  })

  return {
    title: project ? `${project.name} - Project Dashboard` : "Project Dashboard",
    description: project?.description || "Comprehensive project management dashboard"
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  await auth()
  const { projectId } = await params
  
  // Fetch project data
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true
        }
      },
      team: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              role: true
            }
          }
        }
      },
      milestones: {
        include: {
          responsibleUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        },
        orderBy: {
          dueDate: 'asc'
        }
      },
      progressUpdates: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          approvedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  if (!project) {
    notFound()
  }

  // Transform project data for the dashboard
  const projectData = {
    ...project,
    members: project.team.map(t => t.user),
    projectLead: project.owner,
    milestones: project.milestones.map(milestone => ({
      ...milestone,
      responsibleUser: milestone.responsibleUser ? {
        firstName: milestone.responsibleUser.firstName,
        lastName: milestone.responsibleUser.lastName
      } : undefined
    })),
    progressUpdates: project.progressUpdates.map(update => ({
      ...update,
      user: {
        firstName: update.user.firstName,
        lastName: update.user.lastName,
        avatar: update.user.avatar
      },
      approvedBy: update.approvedBy ? {
        firstName: update.approvedBy.firstName,
        lastName: update.approvedBy.lastName,
        avatar: update.approvedBy.avatar
      } : undefined
    }))
  }

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 md:px-6">
              <PermissionChecker 
                requiredPermission="VIEW_PROJECTS"
                fallback={
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      You don't have permission to view this project.
                    </p>
                  </div>
                }
              >
                <Suspense fallback={<div className="py-8 text-center">Loading project dashboard...</div>}>
                  <ProjectDashboard project={projectData} />
                </Suspense>
              </PermissionChecker>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}