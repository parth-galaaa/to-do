'use client'

import { motion } from 'framer-motion'
import { isSameDay } from '@/lib/utils/date-utils'
import { Badge } from '@/components/ui/badge'

interface CalendarDayProps {
	date: Date
	isCurrentMonth: boolean
	isToday: boolean
	isSelected: boolean
	itemCount: number
	onClick: () => void
}

export default function CalendarDay({
	date,
	isCurrentMonth,
	isToday,
	isSelected,
	itemCount,
	onClick,
}: CalendarDayProps) {
	return (
		<motion.button
			onClick={onClick}
			whileHover={{ scale: isCurrentMonth ? 1.05 : 1 }}
			whileTap={{ scale: 0.95 }}
			className={`
        relative aspect-square rounded-lg transition-all
        ${!isCurrentMonth ? 'opacity-30 cursor-default' : 'cursor-pointer'}
        ${isSelected
					? 'bg-primary text-primary-foreground shadow-md'
					: isToday
						? 'bg-accent border-2 border-primary'
						: 'hover:bg-accent'
				}
      `}
			disabled={!isCurrentMonth}
		>
			<div className="flex flex-col items-center justify-center h-full p-1">
				<span className={`text-sm font-medium ${isToday && !isSelected ? 'text-primary' : ''}`}>
					{date.getDate()}
				</span>
				{itemCount > 0 && (
					<Badge
						variant={isSelected ? "secondary" : "default"}
						className="mt-1 h-4 min-w-4 px-1 text-[10px] font-bold"
					>
						{itemCount}
					</Badge>
				)}
			</div>
		</motion.button>
	)
}