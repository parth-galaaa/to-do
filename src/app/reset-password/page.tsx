'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock } from 'lucide-react'

export default function ResetPasswordPage() {
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)
	const router = useRouter()
	const supabase = createClient()

	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError(null)

		// Validate passwords match
		if (newPassword !== confirmPassword) {
			setError('Passwords do not match')
			setLoading(false)
			return
		}

		// Validate password length
		if (newPassword.length < 6) {
			setError('Password must be at least 6 characters long')
			setLoading(false)
			return
		}

		try {
			const { error } = await supabase.auth.updateUser({
				password: newPassword
			})

			if (error) throw error

			setSuccess(true)

			// Redirect to home after 2 seconds
			setTimeout(() => {
				router.push('/')
			}, 2000)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to reset password')
		} finally {
			setLoading(false)
		}
	}

	if (success) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/5 via-background to-secondary/10 p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="space-y-1">
						<CardTitle className="text-2xl font-bold text-center">Password Reset!</CardTitle>
						<CardDescription className="text-center">
							Your password has been successfully reset. Redirecting to login...
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		)
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/5 via-background to-secondary/10 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<div className="flex justify-center mb-2">
						<div className="p-3 rounded-full bg-primary/10">
							<Lock className="h-6 w-6 text-primary" />
						</div>
					</div>
					<CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
					<CardDescription className="text-center">
						Enter your new password below
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleResetPassword}>
					<CardContent className="space-y-4">
						{error && (
							<div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
								{error}
							</div>
						)}
						<div className="space-y-2">
							<Label htmlFor="new-password">New Password</Label>
							<Input
								id="new-password"
								type="password"
								placeholder="••••••••"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								required
								disabled={loading}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirm-password">Confirm Password</Label>
							<Input
								id="confirm-password"
								type="password"
								placeholder="••••••••"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								disabled={loading}
							/>
						</div>
					</CardContent>
					<CardFooter>
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? 'Resetting...' : 'Reset Password'}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	)
}