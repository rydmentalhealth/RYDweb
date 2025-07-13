import { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { TaskBoard } from "@/components/volunteer/task-board"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@/lib/generated/prisma"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Volunteer Dashboard",
  description: "View your assigned tasks and projects",
}

async function getVolunteerTasks(userId: string) {
  const prisma = new PrismaClient()
  
  try {
    // Get tasks assigned to this user directly
    const assignedTasks = await prisma.taskAssignee.findMany({
      where: { userId: userId },
      include: {
        task: {
          include: {
            project: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })
    
    // Format the tasks for the task board
    return assignedTasks.map(assignment => ({
      id: assignment.task.id,
      title: assignment.task.title,
      description: assignment.task.description || undefined,
      priority: assignment.task.priority,
      status: assignment.task.status,
      startDate: assignment.task.startDate?.toISOString() || undefined,
      endDate: assignment.task.endDate?.toISOString() || undefined,
      location: assignment.task.location || undefined,
      project: assignment.task.project || undefined
    }))
  } catch (error) {
    console.error("Error fetching volunteer tasks:", error)
    return []
  } finally {
    await prisma.$disconnect()
  }
}

export default async function VolunteerDashboard() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }
  
  const tasks = await getVolunteerTasks(session.user.id)
  
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 md:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold">My Dashboard</h1>
                  <p className="text-muted-foreground">
                    Welcome back, {session.user.name}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-3 md:px-6 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tasks.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tasks.filter(t => t.status === "COMPLETED").length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tasks.filter(t => t.status === "OVERDUE").length}</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="px-4 md:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Tasks</CardTitle>
                  <CardDescription>
                    View and manage your assigned tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<div className="py-4 text-center">Loading tasks...</div>}>
                    <TaskBoard tasks={tasks} />
                  </Suspense>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 