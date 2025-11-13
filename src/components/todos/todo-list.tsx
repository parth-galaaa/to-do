'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTodos } from '@/lib/hooks/use-todos'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Loader2, CheckCircle2, Circle, Clock } from 'lucide-react'
import TodoItem from './todo-item'
import AddTodoDialog from './add-todo-dialog'

export default function TodoList() {
  const { todos, loading, addTodo, updateTodo, deleteTodo, toggleTodo } = useTodos()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const activeTodos = todos.filter((t) => !t.completed).length
  const completedTodos = todos.filter((t) => t.completed).length

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
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

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {getGreeting()}.
        </h1>
        <p className="text-lg text-muted-foreground">
          What's your plan for today?
        </p>
      </motion.div>

      {/* Add Todo Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer shadow-sm hover:shadow-md"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <CardContent className="flex items-center gap-3 p-6">
            <Plus className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground font-medium">Add Todo</span>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <Circle className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">{activeTodos} Active</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">{completedTodos} Completed</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
            className="rounded-full"
          >
            All
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('active')}
            className="rounded-full"
          >
            Active
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('completed')}
            className="rounded-full"
          >
            Completed
          </Button>
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
                <h3 className="font-semibold text-lg">No todos yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {filter === 'all'
                    ? 'Get started by adding your first todo above'
                    : filter === 'active'
                    ? 'No active todos. Great job staying on top of things!'
                    : 'No completed todos yet. Keep working!'}
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
      />
    </div>
  )
}
