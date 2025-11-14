'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Todo, TodoInsert, TodoUpdate } from '@/lib/types/database'

export function useTodos(listId?: string | null) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchTodos()

    // Set up real-time subscription
    const channel = supabase
      .channel('todos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
        },
        () => {
          fetchTodos()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [listId])

  const fetchTodos = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false })

      if (listId !== undefined) {
        query = query.eq('list_id', listId)
      }

      const { data, error } = await query

      if (error) throw error
      setTodos(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async (todo: Omit<TodoInsert, 'user_id'>) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // Create optimistic todo
      const optimisticTodo = {
        ...todo,
        id: 'temp-' + Date.now(),
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Optimistic update
      setTodos(prev => [optimisticTodo as Todo, ...prev])

      const { data, error } = await supabase
        .from('todos')
        .insert([{ ...todo, user_id: user.id }])
        .select()
        .single()

      if (error) throw error

      // Replace optimistic todo with real one
      setTodos(prev => prev.map(t => t.id === optimisticTodo.id ? data : t))

      return data
    } catch (err) {
      // Revert on error
      fetchTodos()
      setError(err instanceof Error ? err.message : 'Failed to add todo')
      throw err
    }
  }

  const updateTodo = async (id: string, updates: TodoUpdate) => {
    // Store previous state for rollback
    const previousTodos = [...todos]

    // Optimistic update
    setTodos(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))

    try {
      const { data, error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Update with actual data from server
      setTodos(prev => prev.map(t => t.id === id ? data : t))
      return data
    } catch (err) {
      // Revert on error
      setTodos(previousTodos)
      setError(err instanceof Error ? err.message : 'Failed to update todo')
      throw err
    }
  }

  const deleteTodo = async (id: string) => {
    // Optimistic update
    const previousTodos = [...todos]
    setTodos(prev => prev.filter(t => t.id !== id))

    try {
      const { error } = await supabase.from('todos').delete().eq('id', id)

      if (error) throw error
    } catch (err) {
      // Revert on error
      setTodos(previousTodos)
      setError(err instanceof Error ? err.message : 'Failed to delete todo')
      throw err
    }
  }

  const toggleTodo = async (id: string, completed: boolean) => {
    // Optimistic update
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed } : t))

    try {
      return await updateTodo(id, { completed })
    } catch (err) {
      // Revert on error
      fetchTodos()
      throw err
    }
  }

  return {
    todos,
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    refetch: fetchTodos,
  }
}