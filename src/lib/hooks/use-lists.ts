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
			// FIX 1: Do NOT set loading(true) here. 
			// Only initialize loading as true. This prevents the sidebar from 
			// flashing a spinner during background updates.

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
	}, [supabase])

	const broadcastUpdate = () => {
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent(LISTS_UPDATED_EVENT))
		}
	}

	useEffect(() => {
		fetchLists()

		const handleLocalUpdate = () => fetchLists()
		if (typeof window !== 'undefined') {
			window.addEventListener(LISTS_UPDATED_EVENT, handleLocalUpdate)
		}

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

			// FIX 2: Generate the REAL UUID here on the client.
			// This prevents the "key swap" flicker because the ID stays consistent 
			// from optimistic update -> DB insert.
			const newId = crypto.randomUUID()

			const optimisticList = {
				...list,
				id: newId, // Use the permanent ID immediately
				user_id: user.id,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			}

			// Optimistic update
			setLists(prev => [...prev, optimisticList as List])

			const { data, error } = await supabase
				.from('lists')
				.insert([{ ...list, id: newId, user_id: user.id }]) // Send ID to DB
				.select()
				.single()

			if (error) throw error

			// Update with server data (though IDs match, so no visual flicker)
			setLists(prev => prev.map(l => l.id === newId ? data : l))

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