'use client'

import { Todo } from '@/lib/types/database'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { formatDateLong } from '@/lib/utils/date-utils'
import { motion } from 'framer-motion'
import { Calendar, CheckCircle2 } from 'lucide-react'

interface DateItemsModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	date: Date | null
	todos: Todo[]
	onToggle: (id: string, completed: boolean) => void
}

const priorityColors = {
	low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
	medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
	high: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300',
}

export default function DateItemsModal({
	open,
	onOpenChange,
	date,
	todos,
	onToggle,
}: DateItemsModalProps) {
	if (!date) return null

	const activeTodos = todos.filter(t => !t.completed)
	const completedTodos = todos.filter(t => t.completed)

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-xl">
						<Calendar className="h-5 w-5 text-primary" />
						{formatDateLong(date.toISOString())}
					</DialogTitle>
					<DialogDescription>
						{todos.length === 0
							? 'No items due on this date'
							: `${activeTodos.length} active, ${completedTodos.length} completed`
						}
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="max-h-[400px] pr-4">
					<div className="space-y-4 py-2">
						{todos.length === 0 ? (
							<div className="text-center py-8">
								<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
									<Calendar className="h-8 w-8 text-muted-foreground" />
								</div>
								<p className="text-sm text-muted-foreground">
									No items scheduled for this date
								</p>
							</div>
						) : (
							<>
								{/* Active Todos */}
								{activeTodos.length > 0 && (
									<div className="space-y-2">
										<h4 className="text-sm font-semibold text-muted-foreground">Active</h4>
										{activeTodos.map((todo, index) => (
											<motion.div
												key={todo.id}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: index * 0.05 }}
												className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
											>
												<Checkbox
													checked={todo.completed}
													onCheckedChange={(checked) => onToggle(todo.id, checked as boolean)}
													className="mt-0.5"
												/>
												<div className="flex-1 min-w-0">
													<p className="font-medium text-sm">{todo.title}</p>
													{todo.description && (
														<p className="text-xs text-muted-foreground mt-1 line-clamp-2">
															{todo.description}
														</p>
													)}
													{todo.priority && (
														<Badge
															variant="secondary"
															className={`mt-2 text-xs ${priorityColors[todo.priority]}`}
														>
															{todo.priority}
														</Badge>
													)}
												</div>
											</motion.div>
										))}
									</div>
								)}

								{/* Completed Todos */}
								{completedTodos.length > 0 && (
									<div className="space-y-2">
										<h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
											<CheckCircle2 className="h-4 w-4" />
											Completed
										</h4>
										{completedTodos.map((todo, index) => (
											<motion.div
												key={todo.id}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: (activeTodos.length + index) * 0.05 }}
												className="flex items-start gap-3 p-3 rounded-lg border bg-card opacity-60"
											>
												<Checkbox
													checked={todo.completed}
													onCheckedChange={(checked) => onToggle(todo.id, checked as boolean)}
													className="mt-0.5"
												/>
												<div className="flex-1 min-w-0">
													<p className="font-medium text-sm line-through">{todo.title}</p>
													{todo.description && (
														<p className="text-xs text-muted-foreground mt-1 line-clamp-2">
															{todo.description}
														</p>
													)}
												</div>
											</motion.div>
										))}
									</div>
								)}
							</>
						)}
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	)
}