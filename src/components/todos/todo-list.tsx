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
import { isSameDay, parseDateWithoutTimezone } from '@/lib/utils/date-utils'

interface TodoListProps {
  selectedListId: string | null
  selectedList: any | null
  selectedDate?: Date | null
  onClearDateFilter?: () => void
}

export default function TodoList({ selectedListId, selectedList, selectedDate, onClearDateFilter }: TodoListProps) {
  const { todos, loading, addTodo, updateTodo, deleteTodo, toggleTodo } = useTodos(selectedListId)
  const { lists } = useLists()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const listFilteredTodos = useMemo(() => {
    if (!selectedListId) return []
    return todos.filter(todo => todo.list_id === selectedListId)
  }, [todos, selectedListId])

  const dateFilteredTodos = useMemo(() => {
    if (!selectedDate) return listFilteredTodos
    return listFilteredTodos.filter(todo => {
      if (!todo.due_date) return false
      return isSameDay(parseDateWithoutTimezone(todo.due_date), selectedDate)
    })
  }, [listFilteredTodos, selectedDate])

  // Sort: Active items first, then by creation date (newer first)
  // Completed items go to the bottom
  const sortedTodos = useMemo(() => {
    return [...dateFilteredTodos].sort((a, b) => {
      // 1. Sort by completion status (completed last)
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      // 2. Sort by creation date (newest first) inside the groups
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [dateFilteredTodos])

  const filteredTodos = sortedTodos

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

  // --- FIX START: Handle Sync Latency States ---

  // 1. Critical Fix for "Can't select new list": 
  // If we have an ID but the list object hasn't synced from the parent yet, show a loader.
  // This prevents the UI from trying to render a null list or showing "No List Selected" incorrectly.
  if (selectedListId && !selectedList) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
      </div>
    )
  }

  // 2. Optimization: Only show full-screen loader if we have NO data yet.
  // If we are re-fetching in the background, keep showing the old data to prevent flashing.
  if (loading && todos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // --- FIX END ---

  if (!selectedListId) {
    return (
      <Card className="border-dashed bg-transparent shadow-none">
        <CardContent className="flex flex-col items-center justify-center py-24">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto">
              <ListIcon className="h-8 w-8 text-primary/50" />
            </div>
            <h3 className="font-bold text-xl tracking-tight">No List Selected</h3>
            <p className="text-muted-foreground max-w-sm">
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
        className="space-y-8 pb-10"
      >
        {/* Header with Add Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-start justify-between gap-4"
        >
          <div className="space-y-2 flex-1">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              {getListTitle()}
            </h1>
            {selectedList && selectedList.type && (
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: selectedList.color }}></span>
                <p className="text-lg text-muted-foreground capitalize">
                  {selectedList.type} list
                </p>
              </div>
            )}
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size="lg"
            className="gap-2 shrink-0 shadow-lg shadow-primary/20 rounded-full px-6"
          >
            <Plus className="h-5 w-5" />
            New Task
          </Button>
        </motion.div>

        {/* Date Filter Indicator */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl border border-primary/10"
          >
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              Due on {selectedDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearDateFilter}
              className="ml-auto h-7 px-2 hover:bg-primary/10 rounded-lg"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </motion.div>
        )}

        {/* Stats */}
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
            <Card className="border-dashed bg-transparent shadow-none">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <Clock className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="font-semibold text-lg">No tasks found</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {selectedDate
                      ? 'No items due on this date'
                      : 'Your list is empty. Add a task to get moving!'
                    }
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredTodos.map((todo) => (
                  <motion.div
                    key={todo.id}
                    layout // Enables smooth sort reordering
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TodoItem
                      todo={todo}
                      onToggle={(completed) => toggleTodo(todo.id, completed)}
                      onUpdate={updateTodo}
                      onDelete={() => deleteTodo(todo.id)}
                      selectedList={selectedList}
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
          key={selectedList?.id}
        />
      </motion.div>
    </AnimatePresence>
  )
}