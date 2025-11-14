'use client'

import { useState } from 'react'
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Loader2, AlertTriangle } from 'lucide-react'
import { List } from '@/lib/types/database'

interface DeleteListDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	list: List | null
	onDelete: (id: string) => Promise<void>
}

export default function DeleteListDialog({
	open,
	onOpenChange,
	list,
	onDelete
}: DeleteListDialogProps) {
	const [loading, setLoading] = useState(false)

	const handleDelete = async () => {
		if (!list) return

		setLoading(true)
		try {
			await onDelete(list.id)
			onOpenChange(false)
		} catch (error) {
			console.error('Failed to delete list:', error)
		} finally {
			setLoading(false)
		}
	}

	if (!list) return null

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
							<AlertTriangle className="h-5 w-5 text-destructive" />
						</div>
						<AlertDialogTitle className="text-xl">Delete List</AlertDialogTitle>
					</div>
					<AlertDialogDescription className="text-left pt-2">
						Are you sure you want to delete <span className="font-semibold text-foreground">"{list.name}"</span>?
						<br /><br />
						This will permanently delete the list and all its items. This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter className="gap-2">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={loading}
					>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={loading}
						className="gap-2"
					>
						{loading && <Loader2 className="h-4 w-4 animate-spin" />}
						{loading ? 'Deleting...' : 'Delete List'}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}