'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { List, ListInsert, ListUpdate } from '@/lib/types/database'

export function useLists() {
	const [lists, setLists] = useState<List[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const supabase = createClient()

	// Use useCallback to memoize fetchLists and avoid stale closures
	const fetchLists = useCallback(async () => {
		try {
			setLoading(true)
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

	useEffect(() => {
		fetchLists()

		// Set up real-time subscription with proper dependency handling
		const channel = supabase
			.channel('lists-changes')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'lists',
				},
				() => {
					// This will now use the latest fetchLists function
					fetchLists()
				}
			)
			.subscribe()

		return () => {
			supabase.removeChannel(channel)
		}
	}, [supabase, fetchLists]) // Add fetchLists to dependencies

	const addList = async (list: Omit<ListInsert, 'user_id'>) => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser()
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
			return data
		} catch (err) {
			fetchLists() // Revert on error
			setError(err instanceof Error ? err.message : 'Failed to add list')
			throw err
		}
	}

	const updateList = async (id: string, updates: ListUpdate) => {
		const previousLists = [...lists]

		// Optimistic update
		setLists(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l))

		try {
			const { data, error } = await supabase
				.from('lists')
				.update(updates)
				.eq('id', id)
				.select()
				.single()

			if (error) throw error

			// Update with server data
			setLists(prev => prev.map(l => l.id === id ? data : l))
			return data
		} catch (err) {
			setLists(previousLists) // Revert on error
			setError(err instanceof Error ? err.message : 'Failed to update list')
			throw err
		}
	}

	const deleteList = async (id: string) => {
		const previousLists = [...lists]

		// Optimistic update
		setLists(prev => prev.filter(l => l.id !== id))

		try {
			const { error } = await supabase.from('lists').delete().eq('id', id)

			if (error) throw error
		} catch (err) {
			setLists(previousLists) // Revert on error
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