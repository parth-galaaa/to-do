'use client'

import { useState, useEffect } from 'react'
import { Todo, TodoUpdate, List } from '@/lib/types/database'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface EditTodoDialogProps {
  todo: Todo
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (id: string, updates: TodoUpdate) => Promise<any>
  selectedList?: List | null
}

const priorityOptions = [
  { value: 'low', label: 'Low', icon: CheckCircle2, color: 'text-emerald-500' },
  { value: 'medium', label: 'Medium', icon: AlertCircle, color: 'text-amber-500' },
  { value: 'high', label: 'High', icon: AlertCircle, color: 'text-rose-500' },
]

export default function EditTodoDialog({
  todo,
  open,
  onOpenChange,
  onUpdate,
  selectedList,
}: EditTodoDialogProps) {
  const [title, setTitle] = useState(todo.title)
  const [description, setDescription] = useState(todo.description || '')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | null>(todo.priority)
  const [dueDate, setDueDate] = useState(
    todo.due_date ? format(new Date(todo.due_date), 'yyyy-MM-dd') : ''
  )
  const [loading, setLoading] = useState(false)

  // Determine if we should show priority and due date based on list type
  const showPriorityAndDeadline = selectedList?.type === 'task'

  useEffect(() => {
    if (open) {
      setTitle(todo.title)
      setDescription(todo.description || '')
      setPriority(todo.priority)
      setDueDate(todo.due_date ? format(new Date(todo.due_date), 'yyyy-MM-dd') : '')
    }
  }, [open, todo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Fix date to prevent timezone issues (saving day before)
      let formattedDate = null
      if (dueDate) {
        // Parse the date as local time and format as YYYY-MM-DD
        const date = new Date(dueDate + 'T00:00:00')
        formattedDate = date.toISOString().split('T')[0]
      }

      await onUpdate(todo.id, {
        title,
        description: description || null,
        priority: showPriorityAndDeadline ? priority : null,
        due_date: formattedDate,
      })

      onOpenChange(false)
    } catch (error) {
      console.error('Failed to update todo:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Item</DialogTitle>
          <DialogDescription>
            Make changes to your item.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-title"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
                className="h-11"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="edit-description"
                placeholder="Add more details (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                className="min-h-20 resize-none"
              />
            </div>

            {/* Priority - only show for task lists */}
            {showPriorityAndDeadline && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Priority</Label>
                <div className="grid grid-cols-3 gap-2">
                  {priorityOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => setPriority(option.value as 'low' | 'medium' | 'high')}
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${priority === option.value
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                          }`}
                      >
                        <Icon className={`h-5 w-5 ${option.color}`} />
                        <span className="text-xs font-medium">{option.label}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Due Date - only show for task lists */}
            {showPriorityAndDeadline && (
              <div className="space-y-2">
                <Label htmlFor="edit-dueDate" className="text-sm font-medium">
                  Due Date
                </Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={loading}
                  className="h-11"
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !title}
              className="gap-2 bg-linear-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}