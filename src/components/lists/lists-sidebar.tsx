'use client'

import { useState, useMemo } from 'react'
import { useLists } from '@/lib/hooks/use-lists'
import { useTodos } from '@/lib/hooks/use-todos'
import { List } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { List as ListIcon, Plus, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ListItem from './list-item'
import AddListDialog from './add-list-dialog'
import EditListDialog from './edit-list-dialog'
import DeleteListDialog from './delete-list-dialog'

interface ListsSidebarProps {
	selectedListId: string | null
	onSelectList: (listId: string | null) => void
	className?: string
}

export default function ListsSidebar({ selectedListId, onSelectList, className }: ListsSidebarProps) {
	const { lists, loading, addList, updateList, deleteList } = useLists()
	const { todos } = useTodos()

	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const [selectedList, setSelectedList] = useState<List | null>(null)

	const listTodoCounts = useMemo(() => {
		const counts: Record<string, number> = {}
		todos.forEach(todo => {
			if (!todo.completed && todo.list_id) {
				counts[todo.list_id] = (counts[todo.list_id] || 0) + 1
			}
		})
		return counts
	}, [todos])

	const handleAddList = async (listData: any) => {
		try {
			const newList = await addList(listData)
			setIsAddDialogOpen(false)

			// Select the list using the REAL ID returned from DB
			if (newList && newList.id) {
				onSelectList(newList.id)
			}
		} catch (error) {
			console.error('Failed to add list:', error)
		}
	}

	const handleEditList = (list: List) => {
		setSelectedList(list)
		setIsEditDialogOpen(true)
	}

	const handleDeleteList = async (id: string) => {
		try {
			await deleteList(id)
			if (selectedListId === id) {
				onSelectList(null)
			}
			setIsDeleteDialogOpen(false)
		} catch (error) {
			console.error('Failed to delete list:', error)
		}
	}

	const openDeleteDialog = (list: List) => {
		setSelectedList(list)
		setIsDeleteDialogOpen(true)
	}

	// FIX: Only show full loading state if we have NO data.
	if (loading && lists.length === 0) {
		return (
			<div className={`border-r bg-card flex items-center justify-center ${className}`}>
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
			</div>
		)
	}

	return (
		<>
			<motion.aside
				initial={{ x: -100, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ duration: 0.3 }}
				className={`border-r bg-card flex flex-col ${className}`}
			>
				{/* Header */}
				<div className="p-6 space-y-4">
					{/* UPDATED: Flex container now separates text block and button */}
					<div className="flex items-start justify-between">
						<div className="space-y-1">
							<h2 className="text-2xl font-bold tracking-tight">Lists</h2>
							<p className="text-sm text-muted-foreground">
								Organize your tasks by category
							</p>
						</div>

						{/* Button moved outside the text div to sit on the far right */}
						<Button
							onClick={() => setIsAddDialogOpen(true)}
							variant="ghost"
							size="icon"
							className="h-8 w-8"
						>
							<Plus className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{/* Lists */}
				<ScrollArea className="flex-1">
					<div className="p-4 space-y-2">
						<AnimatePresence mode="popLayout">
							{lists.map((list) => (
								<ListItem
									key={list.id}
									list={list}
									isActive={selectedListId === list.id}
									todoCount={listTodoCounts[list.id] || 0}
									onClick={() => onSelectList(list.id)}
									onEdit={() => handleEditList(list)}
									onDelete={() => openDeleteDialog(list)}
								/>
							))}
						</AnimatePresence>

						{lists.length === 0 && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								className="text-center py-8 px-4"
							>
								<div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
									<ListIcon className="h-6 w-6 text-muted-foreground" />
								</div>
								<p className="text-sm text-muted-foreground">
									No lists yet. Create your first list to get started.
								</p>
							</motion.div>
						)}
					</div>
				</ScrollArea>
			</motion.aside>

			<AddListDialog
				open={isAddDialogOpen}
				onOpenChange={setIsAddDialogOpen}
				onAdd={handleAddList}
			/>

			<EditListDialog
				open={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
				list={selectedList}
				onUpdate={updateList}
			/>

			<DeleteListDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
				list={selectedList}
				onDelete={handleDeleteList}
			/>
		</>
	)
}