'use client'

import { useState, useEffect } from 'react'
import { List, ListUpdate } from '@/lib/types/database'
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
import { Loader2 } from 'lucide-react'

interface EditListDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	list: List | null
	onUpdate: (id: string, updates: ListUpdate) => Promise<any>
}

const colorOptions = [
	{ value: '#3b82f6', label: 'Blue' },
	{ value: '#10b981', label: 'Green' },
	{ value: '#f59e0b', label: 'Orange' },
	{ value: '#ef4444', label: 'Red' },
	{ value: '#8b5cf6', label: 'Purple' },
	{ value: '#ec4899', label: 'Pink' },
	{ value: '#14b8a6', label: 'Teal' },
	{ value: '#f97316', label: 'Amber' },
]

export default function EditListDialog({ open, onOpenChange, list, onUpdate }: EditListDialogProps) {
	const [name, setName] = useState('')
	const [color, setColor] = useState('#3b82f6')
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (list) {
			setName(list.name)
			setColor(list.color)
		}
	}, [list])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!list) return

		setLoading(true)

		try {
			await onUpdate(list.id, {
				name,
				color,
			})

			onOpenChange(false)
		} catch (error) {
			console.error('Failed to update list:', error)
		} finally {
			setLoading(false)
		}
	}

	if (!list) return null

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle className="text-2xl">Edit List</DialogTitle>
					<DialogDescription>
						Update your list name and color.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="space-y-5 py-4">
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
							<div className="flex gap-2">
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
							{loading ? 'Saving...' : 'Save Changes'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}