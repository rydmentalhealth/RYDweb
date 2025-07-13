"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Search, 
  Plus, 
  Users, 
  Settings, 
  MoreHorizontal,
  Heart,
  Code,
  Megaphone,
  PenTool,
  Palette,
  ChevronRight
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTeams } from "@/lib/hooks/use-teams"
import { AddTeamSheet } from "./add-team-sheet"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

// Icon mapping for teams
const iconMap = {
  Heart,
  Code,
  Users,
  Megaphone,
  PenTool,
  Palette,
  Search
}

function TeamsLoadingSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <div className="flex items-center space-x-1">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function TeamsClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddTeam, setShowAddTeam] = useState(false)
  
  const { data: teams = [], isLoading, error } = useTeams({
    includeMembers: true,
    activeOnly: false
  })

  // Filter teams based on search query
  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTeamIcon = (iconName?: string | null) => {
    if (!iconName || !iconMap[iconName as keyof typeof iconMap]) {
      return Users
    }
    return iconMap[iconName as keyof typeof iconMap]
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Teams Management</h2>
          <p className="text-muted-foreground">
            Manage organizational teams and team memberships
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <AddTeamSheet 
            open={showAddTeam}
            onOpenChange={setShowAddTeam}
            trigger={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Team
              </Button>
            }
          />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Teams Grid */}
      {isLoading ? (
        <TeamsLoadingSkeleton />
      ) : error ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Teams</CardTitle>
            <CardDescription>
              Failed to load teams. Please try again later.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : filteredTeams.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Teams Found</CardTitle>
            <CardDescription>
              {searchQuery 
                ? `No teams match "${searchQuery}". Try a different search term.`
                : "No teams available. Create your first team to get started."
              }
            </CardDescription>
          </CardHeader>
          {!searchQuery && (
            <CardContent>
              <Button onClick={() => setShowAddTeam(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Team
              </Button>
            </CardContent>
          )}
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team) => {
            const TeamIcon = getTeamIcon(team.icon)
            
            return (
              <Card key={team.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="p-1 rounded"
                        style={{ backgroundColor: team.color || '#4f46e5' }}
                      >
                        <TeamIcon className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="font-semibold">{team.name}</h3>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/teams/${team.id}`}>
                            <Settings className="mr-2 h-4 w-4" />
                            Manage Team
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {team.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {team.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {team._count?.members || 0}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {team._count?.tasks || 0}
                        </span>
                      </div>
                    </div>
                    <Badge 
                      variant={team.isActive ? "default" : "secondary"}
                    >
                      {team.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {/* Team Members Preview */}
                  {team.members && team.members.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {team.members.slice(0, 3).map((member) => (
                            <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                              <AvatarImage src={member.user?.avatar || ""} />
                              <AvatarFallback className="text-xs">
                                {member.user?.firstName?.[0] || ''}
                                {member.user?.lastName?.[0] || ''}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {team.members.length > 3 && (
                            <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">
                                +{team.members.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs"
                          asChild
                        >
                          <Link href={`/dashboard/teams/${team.id}`}>
                            View <ChevronRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
} 