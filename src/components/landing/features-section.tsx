'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Calendar, List, Sparkles } from 'lucide-react'

const features = [
	{
		icon: List,
		title: 'Organize by Lists',
		description: 'Create custom lists to categorize your tasks. Work, personal, shopping - keep everything organized.'
	},
	{
		icon: Calendar,
		title: 'Calendar View',
		description: 'See your tasks on a calendar. Never miss a deadline with date-based task management.'
	},
	{
		icon: CheckCircle2,
		title: 'Simple & Intuitive',
		description: 'Clean, distraction-free interface that helps you focus on what matters most - getting things done.'
	},
	{
		icon: Sparkles,
		title: 'Real-time Sync',
		description: 'Your tasks sync instantly across all devices. Access your todos anywhere, anytime.'
	}
]

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

function FeatureCard({ feature, index }: { feature: typeof features[0], index: number }) {
	const [ref, inView] = useInView()

	return (
		<motion.div
			ref={ref}
			initial={{ opacity: 0, y: 50 }}
			animate={inView ? { opacity: 1, y: 0 } : {}}
			transition={{ duration: 0.5, delay: index * 0.1 }}
			className="group relative"
		>
			<div className="h-full p-8 rounded-2xl border bg-card hover:bg-accent/5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
				<div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
					<feature.icon className="h-6 w-6 text-primary" />
				</div>
				<h3 className="text-xl font-bold mb-2">{feature.title}</h3>
				<p className="text-muted-foreground">{feature.description}</p>
			</div>
		</motion.div>
	)
}

export default function FeaturesSection() {
	const [ref, inView] = useInView()

	return (
		<section id="features" className="py-24 relative overflow-hidden">
			<div className="absolute inset-0 bg-linear-to-b from-background via-muted/5 to-background" />

			<div className="container mx-auto px-4 relative z-10">
				<motion.div
					ref={ref}
					initial={{ opacity: 0, y: 20 }}
					animate={inView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.5 }}
					className="text-center max-w-3xl mx-auto mb-16"
				>
					<h2 className="text-4xl md:text-5xl font-bold mb-4">
						Everything you need to stay productive
					</h2>
					<p className="text-xl text-muted-foreground">
						Simple, powerful features designed to help you accomplish more every day.
					</p>
				</motion.div>

				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
					{features.map((feature, index) => (
						<FeatureCard key={index} feature={feature} index={index} />
					))}
				</div>
			</div>
		</section>
	)
}