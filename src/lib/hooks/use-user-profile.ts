'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types/database'

export function useUserProfile() {
	const [profile, setProfile] = useState<Profile | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const supabase = createClient()

	useEffect(() => {
		fetchProfile()
	}, [])

	const fetchProfile = async () => {
		try {
			setLoading(true)
			const { data: { user } } = await supabase.auth.getUser()

			if (!user) {
				setProfile(null)
				return
			}

			// Try to get profile from profiles table first
			const { data: profileData, error: profileError } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', user.id)
				.maybeSingle() // Use maybeSingle instead of single to handle not found

			if (profileData) {
				setProfile(profileData)
			} else {
				// No profile found or error - use user metadata as fallback
				const displayName = user.user_metadata?.display_name || user.user_metadata?.full_name?.split(' ')[0] || 'there'
				const fullName = user.user_metadata?.full_name || ''

				setProfile({
					id: user.id,
					full_name: fullName,
					display_name: displayName,
					created_at: user.created_at,
					updated_at: user.updated_at || user.created_at
				})

				// Only log error if it's not a "not found" error
				if (profileError && !profileError.message.includes('406') && profileError.code !== 'PGRST116') {
					console.warn('Profile fetch issue:', profileError.message)
				}
			}
		} catch (err) {
			console.warn('Error in fetchProfile:', err)
			// Don't set error state, just use fallback
		} finally {
			setLoading(false)
		}
	}

	const updateProfile = async (updates: { full_name?: string; display_name?: string }) => {
		try {
			const { data: { user } } = await supabase.auth.getUser()
			if (!user) throw new Error('No user found')

			const { error } = await supabase
				.from('profiles')
				.update(updates)
				.eq('id', user.id)

			if (error) throw error

			// Refresh profile after update
			await fetchProfile()
		} catch (err) {
			console.error('Error updating profile:', err)
			throw err
		}
	}

	return { profile, loading, error, updateProfile, refetch: fetchProfile }
}