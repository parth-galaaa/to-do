'use client'

import { useState } from 'react'
import { List, Todo } from '@/lib/types/database'
import { getListIcon } from '@/lib/utils/list-icons'
import { motion } from 'framer-motion'
import { MoreVertical, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

interface ListItemProps {
	list: List
	isActive: boolean
	todoCount: number
	onClick: () => void
	onEdit: () => void
	onDelete: () => void
}

export default function ListItem({
	list,
	isActive,
	todoCount,
	onClick,
	onEdit,
	onDelete
}: ListItemProps) {
	const Icon = getListIcon(list.icon)
	const [isHovered, setIsHovered] = useState(false)

	return (
		<motion.div
			layout
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			whileHover={{ x: 4 }}
			transition={{ duration: 0.2 }}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<div
				className={`
          group relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
          transition-all duration-200
          ${isActive
						? 'bg-primary text-primary-foreground shadow-sm'
						: 'hover:bg-accent text-foreground'
					}
        `}
				onClick={onClick}
			>
				<div
					className="shrink-0 w-8 h-8 rounded-md flex items-center justify-center"
					style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : list.color + '20' }}
				>
					<Icon
						className="h-4 w-4"
						style={{ color: isActive ? 'currentColor' : list.color }}
					/>
				</div>

				<div className="flex-1 min-w-0">
					<span className="text-sm font-medium truncate block">
						{list.name}
					</span>
				</div>

				{/* Count badge - always visible, shifts left on hover */}
				<motion.div
					animate={{ x: isHovered ? -8 : 0 }}
					transition={{ duration: 0.2 }}
					key={`count-${todoCount}`}
				>
					{todoCount > 0 && (
						<Badge
							variant={isActive ? "secondary" : "outline"}
							className="h-5 min-w-5 px-1.5 text-xs font-semibold"
						>
							{todoCount}
						</Badge>
					)}
				</motion.div>

				{/* Menu button - appears on hover */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
						<Button
							variant="ghost"
							size="icon"
							className={`
                h-7 w-7 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0
                ${isActive ? 'hover:bg-primary-foreground/20' : ''}
              `}
						>
							<MoreVertical className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
							<Edit className="h-4 w-4 mr-2" />
							Edit List
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={(e) => { e.stopPropagation(); onDelete(); }}
							className="text-destructive focus:text-destructive"
						>
							<Trash2 className="h-4 w-4 mr-2" />
							Delete List
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</motion.div>
	)
}