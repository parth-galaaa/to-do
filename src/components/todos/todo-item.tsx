'use client'

import { useState } from 'react'
import { Todo, TodoUpdate } from '@/lib/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import EditTodoDialog from './edit-todo-dialog'

interface TodoItemProps {
  todo: Todo
  onToggle: (completed: boolean) => void
  onUpdate: (id: string, updates: TodoUpdate) => Promise<any>
  onDelete: () => void
}

const priorityConfig = {
  low: {
    border: 'border-l-4 border-l-green-500 dark:border-l-green-400',
    badge: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
    icon: CheckCircle2,
  },
  medium: {
    border: 'border-l-4 border-l-yellow-500 dark:border-l-yellow-400',
    badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
    icon: AlertCircle,
  },
  high: {
    border: 'border-l-4 border-l-red-500 dark:border-l-red-400',
    badge: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
    icon: AlertCircle,
  },
}

export default function TodoItem({ todo, onToggle, onUpdate, onDelete }: TodoItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    await onDelete()
  }

  // Handle casual lists that don't have priority
  const config = todo.priority ? priorityConfig[todo.priority] : null
  const PriorityIcon = config?.icon

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.005, y: -2 }}
        transition={{ duration: 0.2 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card
          className={`${config?.border || ''} ${isDeleting ? 'opacity-50' : ''
            } ${todo.completed ? 'bg-muted/30 dark:bg-muted/10' : 'bg-card'
            } hover:shadow-lg transition-all duration-200`}
        >
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="mt-0.5"
              >
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={(checked) => onToggle(checked as boolean)}
                  className="h-5 w-5 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                />
              </motion.div>

              {/* Content */}
              <div className="flex-1 space-y-2 min-w-0">
                <h3
                  className={`font-semibold text-base leading-tight transition-all ${todo.completed
                      ? 'line-through text-muted-foreground'
                      : 'text-foreground'
                    }`}
                >
                  {todo.title}
                </h3>

                {todo.description && (
                  <p className={`text-sm leading-relaxed ${todo.completed
                      ? 'text-muted-foreground/70'
                      : 'text-muted-foreground'
                    }`}>
                    {todo.description}
                  </p>
                )}

                {/* Tags and Info */}
                <div className="flex flex-wrap gap-2 items-center">
                  {config && todo.priority && (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.badge} flex items-center gap-1`}>
                      {PriorityIcon && <PriorityIcon className="h-3 w-3" />}
                      {todo.priority}
                    </span>
                  )}

                  {todo.due_date && (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(todo.due_date), 'MMM dd, yyyy')}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                className="flex gap-1"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditDialogOpen(true)}
                  disabled={isDeleting}
                  className="h-8 w-8 hover:bg-primary/10"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-8 w-8 hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <EditTodoDialog
        todo={todo}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdate={onUpdate}
      />
    </>
  )
}