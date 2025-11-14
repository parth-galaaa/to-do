'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { CheckSquare } from 'lucide-react'

export default function Navbar() {
	return (
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
						<span className="text-xl font-bold">TodoApp</span>
					</Link>

					<div className="flex items-center gap-4">
						<Link href="/login">
							<Button variant="ghost">Login</Button>
						</Link>
						<Link href="/signup">
							<Button>Get Started</Button>
						</Link>
					</div>
				</div>
			</div>
		</motion.nav>
	)
}