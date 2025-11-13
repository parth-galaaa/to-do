'use client'

import { useState } from 'react'
import { TodoInsert, List } from '@/lib/types/database'
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

interface AddTodoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (todo: Omit<TodoInsert, 'user_id'>) => Promise<any>
  selectedList?: List | null
}

const priorityOptions = [
  { value: 'low', label: 'Low', icon: CheckCircle2, color: 'text-emerald-500' },
  { value: 'medium', label: 'Medium', icon: AlertCircle, color: 'text-amber-500' },
  { value: 'high', label: 'High', icon: AlertCircle, color: 'text-rose-500' },
]

export default function AddTodoDialog({ open, onOpenChange, onAdd, selectedList }: AddTodoDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | null>(null)
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)

  const requiresPriority = selectedList?.requires_priority ?? true
  const requiresDueDate = selectedList?.requires_due_date ?? true

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onAdd({
        title,
        description: description || null,
        priority: requiresPriority ? (priority || 'medium') : null,
        due_date: dueDate || null,
        completed: false,
        list_id: selectedList?.id || null,
      })

      // Reset form
      setTitle('')
      setDescription('')
      setPriority(null)
      setDueDate('')
    } catch (error) {
      console.error('Failed to add todo:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add New Item</DialogTitle>
          <DialogDescription>
            {selectedList
              ? `Add a new item to "${selectedList.name}"`
              : 'Create a new task to stay organized and productive.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder={selectedList?.type === 'grocery' || selectedList?.type === 'shopping'
                  ? "What do you need?"
                  : "What needs to be done?"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
                className="h-11"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Add more details (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                className="min-h-20 resize-none"
              />
            </div>

            {/* Priority - only show if required */}
            {requiresPriority && (
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

            {/* Due Date - only show if required or if user wants it */}
            {requiresDueDate && (
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-sm font-medium">
                  Due Date
                </Label>
                <Input
                  id="dueDate"
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
              {loading ? 'Adding...' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}