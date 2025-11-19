'use client'

import { useState, useRef, useEffect } from 'react'
import { Todo, TodoUpdate, List } from '@/lib/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  Pencil,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import EditTodoDialog from './edit-todo-dialog'
import { parseDateWithoutTimezone } from '@/lib/utils/date-utils'

interface TodoItemProps {
  todo: Todo
  onToggle: (completed: boolean) => void
  onUpdate: (id: string, updates: TodoUpdate) => Promise<any>
  onDelete: () => void
  selectedList?: List | null
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

export default function TodoItem({ todo, onToggle, onUpdate, onDelete, selectedList }: TodoItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // New state for description expansion
  const [isExpanded, setIsExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const descriptionRef = useRef<HTMLParagraphElement>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    await onDelete()
  }

  // Check if description overflows (needs "Show More" button)
  useEffect(() => {
    if (descriptionRef.current) {
      if (!isExpanded) {
        const hasOverflow = descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight
        setIsOverflowing(hasOverflow)
      }
    }
  }, [todo.description, isExpanded])

  const config = todo.priority ? priorityConfig[todo.priority] : null
  const PriorityIcon = config?.icon

  return (
    <>
      <motion.div
        layout
        whileHover={{ scale: 1.002, y: -1 }}
        transition={{ duration: 0.15 }}
      >
        <Card
          className={`${config?.border || ''} ${isDeleting ? 'opacity-50' : ''
            } ${todo.completed ? 'bg-muted/30 dark:bg-muted/10' : 'bg-card'
            } hover:shadow-md transition-all duration-200`}
        >
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
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

              {/* Content Container */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  {/* Left Column: Title & Description */}
                  <div className="flex flex-col min-w-0 w-full">
                    <h3 className="font-semibold text-md leading-snug">{todo.title}</h3>

                    {todo.description && todo.description.trim().length > 0 && (
                      <div className="mt-1 pr-1 relative">
                        <p
                          ref={descriptionRef}
                          className={`text-sm leading-normal wrap-break-word transition-all duration-200 ${todo.completed ? 'text-muted-foreground/70' : 'text-muted-foreground'
                            } ${!isExpanded ? 'line-clamp-2' : ''}`}
                        >
                          {todo.description}
                        </p>

                        {(isOverflowing || isExpanded) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setIsExpanded(!isExpanded)
                            }}
                            className="text-xs flex items-center gap-1 mt-1 text-primary/80 hover:text-primary font-medium hover:underline focus:outline-none"
                          >
                            {isExpanded ? (
                              <>Show less <ChevronUp className="h-3 w-3" /></>
                            ) : (
                              <>Show more <ChevronDown className="h-3 w-3" /></>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column Wrapper: Metadata & Actions */}
                  <div className="flex items-start gap-2 shrink-0 pl-1">

                    {/* Sub-Col 1: Priority & Date Badges (Vertical Stack) */}
                    <div className="flex flex-col items-end gap-1.5 min-h-14">
                      {config && todo.priority ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.badge} flex items-center gap-1 whitespace-nowrap h-6`}>
                          {PriorityIcon && <PriorityIcon className="h-3 w-3" />}
                          {todo.priority}
                        </span>
                      ) : (
                        // Spacer if priority is missing but date exists to keep alignment
                        <div className="h-6" />
                      )}

                      {todo.due_date && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full whitespace-nowrap h-6">
                          <Calendar className="h-3 w-3" />
                          {format(parseDateWithoutTimezone(todo.due_date), 'MMM dd')}
                        </span>
                      )}
                    </div>

                    {/* Sub-Col 2: Action Buttons (Vertical Stack) */}
                    <div className="flex flex-col gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsEditDialogOpen(true)}
                        disabled={isDeleting}
                        className="h-6 w-6 hover:bg-primary/10 text-muted-foreground hover:text-primary"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="h-6 w-6 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <EditTodoDialog
        todo={todo}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdate={onUpdate}
        selectedList={selectedList}
      />
    </>
  )
}