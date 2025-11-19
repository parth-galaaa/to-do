'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { SignupDialog } from '@/components/auth/signup-dialog'
import { LoginDialog } from '@/components/auth/login-dialog'

export default function HeroSection() {
	const [showSignup, setShowSignup] = useState(false)
	const [showLogin, setShowLogin] = useState(false)
	return (
		<section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16">
			{/* Animated background linear */}
			<div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-secondary/10" />

			{/* Floating elements */}
			<motion.div
				animate={{
					y: [0, -20, 0],
				}}
				transition={{
					duration: 4,
					repeat: Infinity,
					ease: "easeInOut"
				}}
				className="absolute top-20 left-10 w-20 h-20 rounded-full bg-primary/10 blur-2xl"
			/>
			<motion.div
				animate={{
					y: [0, 20, 0],
				}}
				transition={{
					duration: 5,
					repeat: Infinity,
					ease: "easeInOut"
				}}
				className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-secondary/10 blur-2xl"
			/>

			<div className="container mx-auto px-4 relative z-10 mt-8">
				<div className="max-w-4xl mx-auto text-center space-y-8">
					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						className="text-5xl md:text-7xl font-bold tracking-tight"
					>
						Stay Organized,
						<br />
						<span className="bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
							Get Things Done
						</span>
					</motion.h1>

					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto"
					>
						A beautiful, intuitive todo app that helps you manage tasks,
						organize by lists, and track your progress with ease.
					</motion.p>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
						className="flex flex-col sm:flex-row items-center justify-center gap-4"
					>
						<Button size="lg" className="gap-2 text-lg px-8" onClick={() => setShowSignup(true)}>
							Get Started Free
							<ArrowRight className="h-5 w-5" />
						</Button>
						<Link href="#features">
							<Button size="lg" variant="outline" className="text-lg px-8">
								Learn More
							</Button>
						</Link>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.5, delay: 0.4 }}
						className="mt-16 relative"
					>
					</motion.div>
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
		</section>
	)
}