'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { CheckSquare } from 'lucide-react'
import { LoginDialog } from '@/components/auth/login-dialog'
import { SignupDialog } from '@/components/auth/signup-dialog'

export default function Navbar() {
	const [showLogin, setShowLogin] = useState(false)
	const [showSignup, setShowSignup] = useState(false)

	return (
		<>
			<motion.nav
				initial={{ y: -100 }}
				animate={{ y: 0 }}
				className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b"
			>
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<Link href="/" className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-primary/70 flex items-center justify-center">
								<CheckSquare className="h-5 w-5 text-primary-foreground" />
							</div>
							<span className="text-xl font-bold">CheckIt</span>
						</Link>

						<div className="flex items-center gap-4">
							<Button variant="ghost" onClick={() => setShowLogin(true)}>
								Login
							</Button>
							<Button onClick={() => setShowSignup(true)}>
								Get Started
							</Button>
						</div>
					</div>
				</div>
			</motion.nav>

			<LoginDialog
				open={showLogin}
				onOpenChange={setShowLogin}
				onSignupClick={() => setShowSignup(true)}
			/>
			<SignupDialog
				open={showSignup}
				onOpenChange={setShowSignup}
				onLoginClick={() => setShowLogin(true)}
			/>
		</>
	)
}