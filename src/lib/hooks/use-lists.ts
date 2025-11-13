'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { List, ListInsert, ListUpdate } from '@/lib/types/database'

export function useLists() {
	const [lists, setLists] = useState<List[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const supabase = createClient()

	useEffect(() => {
		fetchLists()

		// Set up real-time subscription
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
					fetchLists()
				}
			)
			.subscribe()

		return () => {
			supabase.removeChannel(channel)
		}
	}, [])

	const fetchLists = async () => {
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
	}

	const addList = async (list: Omit<ListInsert, 'user_id'>) => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser()
			if (!user) throw new Error('No user found')

			const { data, error } = await supabase
				.from('lists')
				.insert([{ ...list, user_id: user.id }])
				.select()
				.single()

			if (error) throw error
			return data
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to add list')
			throw err
		}
	}

	const updateList = async (id: string, updates: ListUpdate) => {
		try {
			const { data, error } = await supabase
				.from('lists')
				.update(updates)
				.eq('id', id)
				.select()
				.single()

			if (error) throw error
			return data
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to update list')
			throw err
		}
	}

	const deleteList = async (id: string) => {
		try {
			const { error } = await supabase.from('lists').delete().eq('id', id)

			if (error) throw error
		} catch (err) {
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