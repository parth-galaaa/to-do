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
import { Mail } from 'lucide-react'

interface ChangeEmailDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	currentEmail: string
}

export function ChangeEmailDialog({ open, onOpenChange, currentEmail }: ChangeEmailDialogProps) {
	const [newEmail, setNewEmail] = useState('')
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
	const supabase = createClient()

	const handleChangeEmail = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setMessage(null)

		try {
			const { error } = await supabase.auth.updateUser({
				email: newEmail
			})

			if (error) throw error

			setMessage({
				type: 'success',
				text: 'Verification email sent! Please check your new email address to confirm the change.'
			})
			setNewEmail('')

			// Close dialog after 3 seconds
			setTimeout(() => {
				onOpenChange(false)
				setMessage(null)
			}, 3000)
		} catch (err) {
			setMessage({
				type: 'error',
				text: err instanceof Error ? err.message : 'Failed to update email'
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
						<Mail className="h-5 w-5" />
						Change Email
					</DialogTitle>
					<DialogDescription>
						Enter your new email address. You'll receive a verification email at your new address.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleChangeEmail}>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="current-email">Current Email</Label>
							<Input
								id="current-email"
								type="email"
								value={currentEmail}
								disabled
								className="bg-muted"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="new-email">New Email</Label>
							<Input
								id="new-email"
								type="email"
								placeholder="Enter new email"
								value={newEmail}
								onChange={(e) => setNewEmail(e.target.value)}
								required
							/>
						</div>
						{message && (
							<div className={`text-sm p-3 rounded-lg border ${message.type === 'success'
									? 'bg-primary/10 text-primary border-primary/20'
									: 'bg-destructive/10 text-destructive border-destructive/20'
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
						<Button type="submit" disabled={loading || !newEmail}>
							{loading ? 'Updating...' : 'Update Email'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}