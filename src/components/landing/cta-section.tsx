'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'

function useInView() {
	const ref = useRef<HTMLDivElement>(null)
	const [inView, setInView] = useState(false)

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setInView(true)
				}
			},
			{ threshold: 0.1 }
		)

		if (ref.current) {
			observer.observe(ref.current)
		}

		return () => {
			if (ref.current) {
				observer.unobserve(ref.current)
			}
		}
	}, [])

	return [ref, inView] as const
}

export default function CTASection() {
	const [ref, inView] = useInView()

	return (
		<section className="py-24 relative overflow-hidden">
			<div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-secondary/5" />

			<div className="container mx-auto px-4 relative z-10">
				<motion.div
					ref={ref}
					initial={{ opacity: 0, y: 20 }}
					animate={inView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.5 }}
					className="max-w-4xl mx-auto text-center"
				>
					<div className="p-12 md:p-16 rounded-3xl bg-linear-to-br from-primary/10 to-secondary/10 border">
						<h2 className="text-4xl md:text-5xl font-bold mb-6">
							Ready to get organized?
						</h2>
						<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
							Join thousands of people who have simplified their task management with our intuitive todo app.
						</p>
						<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
							<Link href="/signup">
								<Button size="lg" className="gap-2 text-lg px-8">
									Start Free Today
									<ArrowRight className="h-5 w-5" />
								</Button>
							</Link>
							<p className="text-sm text-muted-foreground">
								• Free forever
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	)
}