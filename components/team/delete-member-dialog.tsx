"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TrashIcon } from "lucide-react"
import { toast } from "sonner"
import { useDeleteTeamMember } from "@/lib/hooks/use-team-members"

interface DeleteMemberDialogProps {
  memberId: string
  memberName: string
  trigger?: React.ReactNode
}

export function DeleteMemberDialog({ 
  memberId, 
  memberName, 
  trigger 
}: DeleteMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const deleteMutation = useDeleteTeamMember()

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(memberId)
      toast.success("Team member deleted successfully")
      setOpen(false)
    } catch (error) {
      console.error("Error deleting team member:", error)
      toast.error("Failed to delete team member")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" size="icon">
            <TrashIcon className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Team Member</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {memberName}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 