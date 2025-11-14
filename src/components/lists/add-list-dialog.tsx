'use client'

import { useState } from 'react'
import { ListInsert } from '@/lib/types/database'
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
import { motion } from 'framer-motion'
import { Loader2, CheckSquare, List } from 'lucide-react'

interface AddListDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onAdd: (list: Omit<ListInsert, 'user_id'>) => Promise<any>
}

const listTypes = [
	{
		value: 'task',
		label: 'Task List',
		icon: CheckSquare,
		description: 'For work, projects & important items',
		color: '#d97706', // Amber
	},
	{
		value: 'casual',
		label: 'Casual List',
		icon: List,
		description: 'For shopping, notes & casual items',
		color: '#ea580c', // Orange
	},
]

const colorOptions = [
	{ value: '#d97706', label: 'Amber' },
	{ value: '#ea580c', label: 'Orange' },
	{ value: '#dc2626', label: 'Red' },
	{ value: '#16a34a', label: 'Green' },
	{ value: '#0891b2', label: 'Cyan' },
	{ value: '#9333ea', label: 'Purple' },
	{ value: '#db2777', label: 'Pink' },
	{ value: '#ca8a04', label: 'Yellow' },
]

export default function AddListDialog({ open, onOpenChange, onAdd }: AddListDialogProps) {
	const [name, setName] = useState('')
	const [type, setType] = useState<'task' | 'casual'>('task')
	const [color, setColor] = useState('#d97706')
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)

		try {
			const iconName = listTypes.find(t => t.value === type)?.icon.name || 'List'

			await onAdd({
				name,
				type,
				color,
				icon: iconName,
			})

			// Reset form
			setName('')
			setType('task')
			setColor('#d97706')
			onOpenChange(false)
		} catch (error) {
			console.error('Failed to add list:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleTypeSelect = (selectedType: typeof listTypes[0]) => {
		setType(selectedType.value as any)
		setColor(selectedType.color)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[520px]">
				<DialogHeader>
					<DialogTitle className="text-2xl">Create New List</DialogTitle>
					<DialogDescription>
						Choose a list type and give it a name to get started.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="space-y-5 py-4">
						{/* List Type Selection */}
						<div className="space-y-3">
							<Label className="text-sm font-medium">List Type</Label>
							<div className="grid grid-cols-2 gap-3">
								{listTypes.map((listType) => {
									const Icon = listType.icon
									return (
										<motion.button
											key={listType.value}
											type="button"
											onClick={() => handleTypeSelect(listType)}
											disabled={loading}
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
											className={`
                        relative flex flex-col items-start gap-2 p-4 rounded-lg border-2 transition-all text-left
                        ${type === listType.value
													? 'border-primary bg-primary/5'
													: 'border-border hover:border-primary/50'
												}
                      `}
										>
											<div
												className="w-10 h-10 rounded-md flex items-center justify-center"
												style={{ backgroundColor: listType.color + '20' }}
											>
												<Icon className="h-5 w-5" style={{ color: listType.color }} />
											</div>
											<div>
												<div className="font-semibold text-sm">{listType.label}</div>
												<div className="text-xs text-muted-foreground">{listType.description}</div>
												<div className="text-xs text-muted-foreground mt-1">
													{listType.value === 'task'
														? '📅 Shows priority & deadline'
														: '✏️ Simple title & description'}
												</div>
											</div>
										</motion.button>
									)
								})}
							</div>
						</div>

						{/* List Name */}
						<div className="space-y-2">
							<Label htmlFor="name" className="text-sm font-medium">
								List Name <span className="text-destructive">*</span>
							</Label>
							<Input
								id="name"
								placeholder="e.g., Weekly Groceries, Work Tasks"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								disabled={loading}
								className="h-11"
							/>
						</div>

						{/* Color Picker */}
						<div className="space-y-2">
							<Label className="text-sm font-medium">Color</Label>
							<div className="flex gap-2 flex-wrap">
								{colorOptions.map((colorOption) => (
									<motion.button
										key={colorOption.value}
										type="button"
										onClick={() => setColor(colorOption.value)}
										disabled={loading}
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.95 }}
										className={`
                      w-10 h-10 rounded-full transition-all
                      ${color === colorOption.value
												? 'ring-2 ring-offset-2 ring-primary'
												: 'hover:ring-2 hover:ring-offset-2 hover:ring-primary/50'
											}
                    `}
										style={{ backgroundColor: colorOption.value }}
										aria-label={colorOption.label}
									/>
								))}
							</div>
						</div>
					</div>

					<DialogFooter className="gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={loading}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={loading || !name}
							className="gap-2"
						>
							{loading && <Loader2 className="h-4 w-4 animate-spin" />}
							{loading ? 'Creating...' : 'Create List'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}