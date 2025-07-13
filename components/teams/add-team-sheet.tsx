"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useAddTeam, type CreateTeamData } from "@/lib/hooks/use-teams"
import { 
  Heart, 
  Code, 
  Users, 
  Megaphone, 
  PenTool, 
  Palette, 
  Search,
  FileText,
  Target
} from "lucide-react"

interface AddTeamSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: React.ReactNode
}

// Predefined team options
const PREDEFINED_TEAMS = [
  {
    name: "Therapy",
    description: "Mental health therapy and counseling services",
    color: "#10b981",
    icon: "Heart"
  },
  {
    name: "Web and IT",
    description: "Website development, IT support, and digital infrastructure",
    color: "#3b82f6",
    icon: "Code"
  },
  {
    name: "Events and Community Outreach",
    description: "Community events, outreach programs, and public engagement",
    color: "#f59e0b",
    icon: "Users"
  },
  {
    name: "Marketing and PR",
    description: "Marketing campaigns, public relations, and brand management",
    color: "#ec4899",
    icon: "Megaphone"
  },
  {
    name: "Writing and Content Creation",
    description: "Content writing, documentation, and editorial work",
    color: "#8b5cf6",
    icon: "PenTool"
  },
  {
    name: "Graphics and Media Production",
    description: "Graphic design, video production, and visual content creation",
    color: "#f97316",
    icon: "Palette"
  },
  {
    name: "Grants and Research",
    description: "Grant writing, research initiatives, and funding opportunities",
    color: "#06b6d4",
    icon: "Search"
  }
]

const ICON_OPTIONS = [
  { value: "Heart", label: "Heart", icon: Heart },
  { value: "Code", label: "Code", icon: Code },
  { value: "Users", label: "Users", icon: Users },
  { value: "Megaphone", label: "Megaphone", icon: Megaphone },
  { value: "PenTool", label: "Pen Tool", icon: PenTool },
  { value: "Palette", label: "Palette", icon: Palette },
  { value: "Search", label: "Search", icon: Search },
  { value: "FileText", label: "File Text", icon: FileText },
  { value: "Target", label: "Target", icon: Target },
]

const COLOR_OPTIONS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ec4899", 
  "#8b5cf6", "#f97316", "#06b6d4", "#ef4444",
  "#84cc16", "#f472b6", "#a78bfa", "#fbbf24"
]

export function AddTeamSheet({ open, onOpenChange, trigger }: AddTeamSheetProps) {
  const [formData, setFormData] = useState<CreateTeamData>({
    name: "",
    description: "",
    color: "#4f46e5",
    icon: "Users",
    isActive: true
  })
  const [useTemplate, setUseTemplate] = useState(false)

  const addTeamMutation = useAddTeam()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      return
    }

    try {
      await addTeamMutation.mutateAsync(formData)
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        color: "#4f46e5",
        icon: "Users",
        isActive: true
      })
      setUseTemplate(false)
      onOpenChange(false)
    } catch (error) {
      console.error("Error creating team:", error)
    }
  }

  const handleTemplateSelect = (template: typeof PREDEFINED_TEAMS[0]) => {
    setFormData({
      ...formData,
      name: template.name,
      description: template.description,
      color: template.color,
      icon: template.icon
    })
    setUseTemplate(false)
  }

  const selectedIcon = ICON_OPTIONS.find(opt => opt.value === formData.icon)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Add New Team</SheetTitle>
          <SheetDescription>
            Create a new team to organize volunteers and assign tasks.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Use Template</Label>
              <Switch
                checked={useTemplate}
                onCheckedChange={setUseTemplate}
              />
            </div>
            
            {useTemplate && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <Label className="text-xs text-muted-foreground">
                  Select a predefined team template:
                </Label>
                {PREDEFINED_TEAMS.map((template) => {
                  const TemplateIcon = ICON_OPTIONS.find(opt => opt.value === template.icon)?.icon || Users
                  return (
                    <button
                      key={template.name}
                      type="button"
                      onClick={() => handleTemplateSelect(template)}
                      className="w-full p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="p-2 rounded"
                          style={{ backgroundColor: template.color }}
                        >
                          <TemplateIcon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            {template.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Team Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Team Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter team name"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this team does"
              rows={3}
            />
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label>Team Icon</Label>
            <Select
              value={formData.icon}
              onValueChange={(value) => setFormData({ ...formData, icon: value })}
            >
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center space-x-2">
                    {selectedIcon && <selectedIcon.icon className="h-4 w-4" />}
                    <span>{selectedIcon?.label}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <option.icon className="h-4 w-4" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>Team Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded border-2 ${
                    formData.color === color ? 'border-gray-900' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Active Team</Label>
              <div className="text-xs text-muted-foreground">
                Active teams can be assigned tasks and members
              </div>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>

          <SheetFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!formData.name.trim() || addTeamMutation.isPending}
            >
              {addTeamMutation.isPending ? "Creating..." : "Create Team"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
} 