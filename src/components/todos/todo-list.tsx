'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTodos } from '@/lib/hooks/use-todos'
import { useLists } from '@/lib/hooks/use-lists'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Loader2, CheckCircle2, Circle, Clock, Calendar, X, List as ListIcon } from 'lucide-react'
import TodoItem from './todo-item'
import AddTodoDialog from './add-todo-dialog'
import { isSameDay } from '@/lib/utils/date-utils'

interface TodoListProps {
  selectedListId: string | null
  selectedDate?: Date | null
  onClearDateFilter?: () => void
}

export default function TodoList({ selectedListId, selectedDate, onClearDateFilter }: TodoListProps) {
  const { todos, loading, addTodo, updateTodo, deleteTodo, toggleTodo } = useTodos()
  const { lists } = useLists()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Get selected list
  const selectedList = useMemo(() => {
    return selectedListId ? lists.find(l => l.id === selectedListId) : null
  }, [selectedListId, lists])

  // Filter todos by selected list
  const listFilteredTodos = useMemo(() => {
    if (!selectedListId) {
      return []
    }
    return todos.filter(todo => todo.list_id === selectedListId)
  }, [todos, selectedListId])

  // Further filter by selected date if provided
  const dateFilteredTodos = useMemo(() => {
    if (!selectedDate) return listFilteredTodos

    return listFilteredTodos.filter(todo => {
      if (!todo.due_date) return false
      return isSameDay(new Date(todo.due_date), selectedDate)
    })
  }, [listFilteredTodos, selectedDate])

  // Show all todos (both active and completed)
  const filteredTodos = dateFilteredTodos

  const activeTodos = dateFilteredTodos.filter((t) => !t.completed).length
  const completedTodos = dateFilteredTodos.filter((t) => t.completed).length

  const getListTitle = () => {
    if (selectedList) return selectedList.name
    return 'Select a list'
  }

  const handleAddTodo = async (todo: any) => {
    await addTodo(todo)
    setIsAddDialogOpen(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Empty state when no list is selected
  if (!selectedListId) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-center space-y-3">
            <ListIcon className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="font-semibold text-lg">No List Selected</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Select a list from the sidebar or create a new one to get started
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={selectedListId}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        {/* Header with Add Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-start justify-between gap-4"
        >
          <div className="space-y-2 flex-1">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
              {getListTitle()}
            </h1>
            {selectedList && selectedList.type && (
              <p className="text-lg text-muted-foreground capitalize">
                {selectedList.type} list
              </p>
            )}
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size="sm"
            className="gap-2 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </motion.div>

        {/* Date Filter Indicator */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg border border-accent"
          >
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              Showing items due on {selectedDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearDateFilter}
              className="ml-auto h-6 px-2"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          </motion.div>
        )}

        {/* Stats (no filter buttons) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex gap-6"
        >
          <div className="flex items-center gap-2">
            <Circle className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium">{activeTodos} Active</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">{completedTodos} Completed</span>
          </div>
        </motion.div>

        {/* Todo List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {filteredTodos.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center space-y-3"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">No items yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {selectedDate
                      ? 'No items due on this date'
                      : 'Get started by adding your first item above'
                    }
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredTodos.map((todo, index) => (
                  <motion.div
                    key={todo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100, height: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <TodoItem
                      todo={todo}
                      onToggle={(completed) => toggleTodo(todo.id, completed)}
                      onUpdate={updateTodo}
                      onDelete={() => deleteTodo(todo.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        <AddTodoDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onAdd={handleAddTodo}
          selectedList={selectedList}
        />
      </motion.div>
    </AnimatePresence>
  )
}