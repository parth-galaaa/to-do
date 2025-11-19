'use client'

import { useState } from 'react'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Settings, Mail, Lock, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ChangeEmailDialog } from './change-email-dialog'
import { ChangePasswordDialog } from './change-password-dialog'

interface SettingsMenuProps {
	user: any
	profile: any
}

export default function SettingsMenu({ user, profile }: SettingsMenuProps) {
	const [emailDialogOpen, setEmailDialogOpen] = useState(false)
	const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
	const router = useRouter()
	const supabase = createClient()

	const handleLogout = async () => {
		await supabase.auth.signOut()
		router.push('/')
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" size="icon">
						<Settings className="h-5 w-5" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					<DropdownMenuLabel>
						{profile?.display_name || 'User'}
					</DropdownMenuLabel>
					<DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
						{user.email}
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => setEmailDialogOpen(true)}>
						<Mail className="mr-2 h-4 w-4" />
						Change Email
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setPasswordDialogOpen(true)}>
						<Lock className="mr-2 h-4 w-4" />
						Change Password
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={handleLogout}>
						<LogOut className="mr-2 h-4 w-4" />
						Logout
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<ChangeEmailDialog
				open={emailDialogOpen}
				onOpenChange={setEmailDialogOpen}
				currentEmail={user.email}
			/>
			<ChangePasswordDialog
				open={passwordDialogOpen}
				onOpenChange={setPasswordDialogOpen}
			/>
		</>
	)
}