import { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { ProjectAnalytics } from "@/components/projects/project-analytics"
import { auth } from "@/lib/auth"
import { Suspense } from "react"
import PermissionChecker from "@/components/auth/permission-checker"
import { db } from "@/lib/db"

export const metadata: Metadata = {
  title: "Project Overview",
  description: "Comprehensive project management overview and analytics dashboard.",
}

export default async function ProjectOverviewPage() {
  await auth()
  
  // Fetch all projects for analytics
  const projects = await db.project.findMany({
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
              avatar: true
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
          }
        }
      }
    }
  })

  // Transform projects data for analytics
  const projectsData = projects.map(project => ({
    ...project,
    members: project.team.map(t => t.user),
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
      }
    }))
  }))

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 md:px-6">
              <PermissionChecker 
                requiredPermission="VIEW_PROJECT_ANALYTICS"
                fallback={
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      You don't have permission to view project analytics.
                    </p>
                  </div>
                }
              >
                <Suspense fallback={<div className="py-8 text-center">Loading project overview...</div>}>
                  <ProjectAnalytics projects={projectsData} />
                </Suspense>
              </PermissionChecker>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}