'use client'

import { useState } from 'react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { Lock } from 'lucide-react'

interface ChangePasswordDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
	const supabase = createClient()

	const handleChangePassword = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setMessage(null)

		// Validate passwords match
		if (newPassword !== confirmPassword) {
			setMessage({
				type: 'error',
				text: 'Passwords do not match'
			})
			setLoading(false)
			return
		}

		// Validate password length
		if (newPassword.length < 6) {
			setMessage({
				type: 'error',
				text: 'Password must be at least 6 characters long'
			})
			setLoading(false)
			return
		}

		try {
			const { error } = await supabase.auth.updateUser({
				password: newPassword
			})

			if (error) throw error

			setMessage({
				type: 'success',
				text: 'Password updated successfully!'
			})
			setNewPassword('')
			setConfirmPassword('')

			// Close dialog after 2 seconds
			setTimeout(() => {
				onOpenChange(false)
				setMessage(null)
			}, 2000)
		} catch (err) {
			setMessage({
				type: 'error',
				text: err instanceof Error ? err.message : 'Failed to update password'
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Lock className="h-5 w-5" />
						Change Password
					</DialogTitle>
					<DialogDescription>
						Enter your new password. Must be at least 6 characters long.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleChangePassword}>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="new-password">New Password</Label>
							<Input
								id="new-password"
								type="password"
								placeholder="Enter new password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirm-password">Confirm Password</Label>
							<Input
								id="confirm-password"
								type="password"
								placeholder="Confirm new password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
							/>
						</div>
						{message && (
							<div className={`text-sm p-3 rounded-lg ${message.type === 'success'
									? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
									: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
								}`}>
								{message.text}
							</div>
						)}
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={loading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={loading || !newPassword || !confirmPassword}>
							{loading ? 'Updating...' : 'Update Password'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}