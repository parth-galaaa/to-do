'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckSquare } from 'lucide-react'
import { SignupDialog } from '@/components/auth/signup-dialog'
import { LoginDialog } from '@/components/auth/login-dialog'

export default function Footer() {
	const [showSignup, setShowSignup] = useState(false)
	const [showLogin, setShowLogin] = useState(false)
	const currentYear = new Date().getFullYear()

	return (
		<footer className="border-t bg-card">
			<div className="container mx-auto px-4 py-12">
				<div className="grid md:grid-cols-4 gap-8">
					{/* Brand */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-primary/70 flex items-center justify-center">
								<CheckSquare className="h-5 w-5 text-primary-foreground" />
							</div>
							<span className="text-xl font-bold">TodoApp</span>
						</div>
						<p className="text-sm text-muted-foreground">
							Simple, beautiful task management for everyone.
						</p>
					</div>

					{/* Product */}
					<div>
						<h3 className="font-semibold mb-4">Product</h3>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>
								<Link href="#features" className="hover:text-foreground transition-colors">
									Features
								</Link>
							</li>
							<li>
								<button onClick={() => setShowSignup(true)} className="hover:text-foreground transition-colors">
									Pricing
								</button>
							</li>
						</ul>
					</div>

					{/* Company */}
					<div>
						<h3 className="font-semibold mb-4">Company</h3>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>
								<Link href="#" className="hover:text-foreground transition-colors">
									About
								</Link>
							</li>
							<li>
								<Link href="#" className="hover:text-foreground transition-colors">
									Contact
								</Link>
							</li>
						</ul>
					</div>

					{/* Legal */}
					<div>
						<h3 className="font-semibold mb-4">Legal</h3>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>
								<Link href="#" className="hover:text-foreground transition-colors">
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link href="#" className="hover:text-foreground transition-colors">
									Terms of Service
								</Link>
							</li>
						</ul>
					</div>
				</div>

				<div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
					<p>&copy; {currentYear} Checkit. All rights reserved.</p>
				</div>
			</div>

			<SignupDialog
				open={showSignup}
				onOpenChange={setShowSignup}
				onLoginClick={() => setShowLogin(true)}
			/>
			<LoginDialog
				open={showLogin}
				onOpenChange={setShowLogin}
				onSignupClick={() => setShowSignup(true)}
			/>
		</footer>
	)
}