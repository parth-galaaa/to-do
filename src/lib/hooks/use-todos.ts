'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Todo, TodoInsert, TodoUpdate } from '@/lib/types/database'

const TODOS_UPDATED_EVENT = 'todos-updated-event'

export function useTodos(listId?: string | null) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Memoize fetchTodos
  const fetchTodos = useCallback(async () => {
    try {
      // Only show loading spinner on initial empty state to avoid flickering
      if (todos.length === 0) setLoading(true)

      let query = supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false })

      if (listId) {
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
  }, [listId, supabase]) // Added deps

  const broadcastUpdate = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(TODOS_UPDATED_EVENT))
    }
  }

  useEffect(() => {
    fetchTodos()

    // 1. Listen for local updates (sync Calendar and List views)
    const handleLocalUpdate = () => fetchTodos()
    if (typeof window !== 'undefined') {
      window.addEventListener(TODOS_UPDATED_EVENT, handleLocalUpdate)
    }

    // 2. Listen for Realtime updates
    const channelId = `todos-channel-${listId || 'all-items'}`
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        (payload) => {
          if (listId) {
            const newItem = payload.new as Todo
            const oldItem = payload.old as Todo
            // Filter irrelevant updates
            if (
              (newItem && newItem.list_id !== listId) &&
              (oldItem && oldItem.list_id !== listId) &&
              payload.eventType !== 'DELETE'
            ) {
              return
            }
          }
          fetchTodos()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      if (typeof window !== 'undefined') {
        window.removeEventListener(TODOS_UPDATED_EVENT, handleLocalUpdate)
      }
    }
  }, [listId, fetchTodos, supabase])

  const addTodo = async (todo: Omit<TodoInsert, 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const optimisticTodo = {
        ...todo,
        id: 'temp-' + Date.now(),
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed: false
      }

      setTodos(prev => [optimisticTodo as Todo, ...prev])

      const { data, error } = await supabase
        .from('todos')
        .insert([{ ...todo, user_id: user.id }])
        .select()
        .single()

      if (error) throw error

      setTodos(prev => prev.map(t => t.id === optimisticTodo.id ? data : t))
      broadcastUpdate() // Notify Calendar
      return data
    } catch (err) {
      fetchTodos()
      setError(err instanceof Error ? err.message : 'Failed to add todo')
      throw err
    }
  }

  const updateTodo = async (id: string, updates: TodoUpdate) => {
    const previousTodos = [...todos]
    setTodos(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))

    try {
      const { data, error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setTodos(prev => prev.map(t => t.id === id ? data : t))
      broadcastUpdate() // Notify Calendar
      return data
    } catch (err) {
      setTodos(previousTodos)
      setError(err instanceof Error ? err.message : 'Failed to update todo')
      throw err
    }
  }

  const deleteTodo = async (id: string) => {
    const previousTodos = [...todos]
    setTodos(prev => prev.filter(t => t.id !== id))

    try {
      const { error } = await supabase.from('todos').delete().eq('id', id)
      if (error) throw error
      broadcastUpdate() // Notify Calendar
    } catch (err) {
      setTodos(previousTodos)
      setError(err instanceof Error ? err.message : 'Failed to delete todo')
      throw err
    }
  }

  const toggleTodo = async (id: string, completed: boolean) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed } : t))
    try {
      const data = await updateTodo(id, { completed })
      // No need to broadcast here as updateTodo already does it
      return data
    } catch (err) {
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