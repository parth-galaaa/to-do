'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { List, ListInsert, ListUpdate } from '@/lib/types/database'

// Event name for cross-component communication
const LISTS_UPDATED_EVENT = 'lists-updated-event'

export function useLists() {
	const [lists, setLists] = useState<List[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const supabase = createClient()

	const fetchLists = useCallback(async () => {
		try {
			// Don't set loading to true here to prevent UI flashing during background updates
			// only set it on initial load if lists is empty
			if (lists.length === 0) setLoading(true)

			const { data, error } = await supabase
				.from('lists')
				.select('*')
				.order('created_at', { ascending: true })

			if (error) throw error
			setLists(data || [])
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred')
		} finally {
			setLoading(false)
		}
	}, [supabase]) // Removed 'lists.length' to strictly follow deps

	// Helper to broadcast updates to other components
	const broadcastUpdate = () => {
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent(LISTS_UPDATED_EVENT))
		}
	}

	useEffect(() => {
		fetchLists()

		// 1. Listen for local updates (from other components)
		const handleLocalUpdate = () => fetchLists()
		if (typeof window !== 'undefined') {
			window.addEventListener(LISTS_UPDATED_EVENT, handleLocalUpdate)
		}

		// 2. Listen for DB updates (Supabase Realtime)
		const channel = supabase
			.channel('lists-changes')
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'lists' },
				() => fetchLists()
			)
			.subscribe()

		return () => {
			supabase.removeChannel(channel)
			if (typeof window !== 'undefined') {
				window.removeEventListener(LISTS_UPDATED_EVENT, handleLocalUpdate)
			}
		}
	}, [fetchLists, supabase])

	const addList = async (list: Omit<ListInsert, 'user_id'>) => {
		try {
			const { data: { user } } = await supabase.auth.getUser()
			if (!user) throw new Error('No user found')

			// Optimistic update
			const optimisticList = {
				...list,
				id: 'temp-' + Date.now(),
				user_id: user.id,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			}
			setLists(prev => [...prev, optimisticList as List])

			const { data, error } = await supabase
				.from('lists')
				.insert([{ ...list, user_id: user.id }])
				.select()
				.single()

			if (error) throw error

			// Replace optimistic with real data
			setLists(prev => prev.map(l => l.id === optimisticList.id ? data : l))

			// Broadcast change so Parent/Sidebar sync up
			broadcastUpdate()

			return data
		} catch (err) {
			fetchLists()
			setError(err instanceof Error ? err.message : 'Failed to add list')
			throw err
		}
	}

	const updateList = async (id: string, updates: ListUpdate) => {
		const previousLists = [...lists]
		setLists(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l))

		try {
			const { data, error } = await supabase
				.from('lists')
				.update(updates)
				.eq('id', id)
				.select()
				.single()

			if (error) throw error

			setLists(prev => prev.map(l => l.id === id ? data : l))
			broadcastUpdate()
			return data
		} catch (err) {
			setLists(previousLists)
			setError(err instanceof Error ? err.message : 'Failed to update list')
			throw err
		}
	}

	const deleteList = async (id: string) => {
		const previousLists = [...lists]
		// Optimistic update
		setLists(prev => prev.filter(l => l.id !== id))

		try {
			const { error: todosError } = await supabase.from('todos').delete().eq('list_id', id)
			if (todosError) throw todosError

			const { error } = await supabase.from('lists').delete().eq('id', id)
			if (error) throw error

			broadcastUpdate()
		} catch (err) {
			setLists(previousLists)
			setError(err instanceof Error ? err.message : 'Failed to delete list')
			throw err
		}
	}

	return {
		lists,
		loading,
		error,
		addList,
		updateList,
		deleteList,
		refetch: fetchLists,
	}
}