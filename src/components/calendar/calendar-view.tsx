'use client'

import { useState, useMemo } from 'react'
import { useTodos } from '@/lib/hooks/use-todos'
import { motion } from 'framer-motion'
import { getDaysInMonth, isSameDay } from '@/lib/utils/date-utils'
import CalendarHeader from './calendar-header'
import CalendarDay from './calendar-day'
import { Separator } from '@/components/ui/separator'

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface CalendarViewProps {
	className?: string
	selectedDate: Date | null
	onDateSelect: (date: Date | null) => void
}

export default function CalendarView({ className, selectedDate, onDateSelect }: CalendarViewProps) {
	const [currentDate, setCurrentDate] = useState(new Date())

	const { todos } = useTodos()

	const year = currentDate.getFullYear()
	const month = currentDate.getMonth()

	// Get days for current month
	const daysInMonth = getDaysInMonth(year, month)

	// Get first day of month to calculate offset
	const firstDayOfMonth = new Date(year, month, 1).getDay()

	// Get days from previous month to fill the grid
	const prevMonthDays = firstDayOfMonth
	const prevMonth = month === 0 ? 11 : month - 1
	const prevMonthYear = month === 0 ? year - 1 : year
	const daysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate()

	const previousMonthDays = Array.from(
		{ length: prevMonthDays },
		(_, i) => new Date(prevMonthYear, prevMonth, daysInPrevMonth - prevMonthDays + i + 1)
	)

	// Calculate how many days from next month we need
	const totalCells = 42 // 6 rows x 7 days
	const nextMonthDays = totalCells - (previousMonthDays.length + daysInMonth.length)
	const nextMonth = month === 11 ? 0 : month + 1
	const nextMonthYear = month === 11 ? year + 1 : year

	const followingMonthDays = Array.from(
		{ length: nextMonthDays },
		(_, i) => new Date(nextMonthYear, nextMonth, i + 1)
	)

	const allDays = [...previousMonthDays, ...daysInMonth, ...followingMonthDays]

	// Calculate todo counts per day
	const todoCounts = useMemo(() => {
		const counts: Record<string, number> = {}
		todos.forEach(todo => {
			if (todo.due_date && !todo.completed) {
				const dateKey = new Date(todo.due_date).toDateString()
				counts[dateKey] = (counts[dateKey] || 0) + 1
			}
		})
		return counts
	}, [todos])

	const handleDayClick = (date: Date, isCurrentMonth: boolean) => {
		if (!isCurrentMonth) return

		// Toggle selection - click again to deselect
		if (selectedDate && isSameDay(date, selectedDate)) {
			onDateSelect(null)
		} else {
			onDateSelect(date)
		}
	}

	const handlePreviousMonth = () => {
		setCurrentDate(new Date(year, month - 1, 1))
	}

	const handleNextMonth = () => {
		setCurrentDate(new Date(year, month + 1, 1))
	}

	const handleToday = () => {
		const today = new Date()
		setCurrentDate(today)
		onDateSelect(today)
	}

	const today = new Date()

	return (
		<motion.aside
			initial={{ x: 100, opacity: 0 }}
			animate={{ x: 0, opacity: 1 }}
			transition={{ duration: 0.3 }}
			className={`flex flex-col border-l bg-card overflow-y-auto ${className}`}
		>
			<div className="p-4 md:p-6 space-y-4 md:space-y-6">
				<div className="space-y-1">
					<h2 className="text-xl md:text-2xl font-bold tracking-tight">Calendar</h2>
					<p className="text-xs md:text-sm text-muted-foreground">
						View tasks by due date
					</p>
				</div>

				<Separator />

				<CalendarHeader
					currentDate={currentDate}
					onPreviousMonth={handlePreviousMonth}
					onNextMonth={handleNextMonth}
					onToday={handleToday}
				/>

				{/* Calendar Grid */}
				<div className="space-y-2">
					{/* Week day headers */}
					<div className="grid grid-cols-7 gap-1 text-center mb-2">
						{weekDays.map(day => (
							<div key={day} className="text-xs font-medium text-muted-foreground py-1">
								{day}
							</div>
						))}
					</div>

					{/* Calendar days */}
					<div className="grid grid-cols-7 gap-1">
						{allDays.map((date, index) => {
							const isCurrentMonth = date.getMonth() === month
							const isToday = isSameDay(date, today)
							const isSelected = selectedDate ? isSameDay(date, selectedDate) : false
							const itemCount = todoCounts[date.toDateString()] || 0

							return (
								<CalendarDay
									key={index}
									date={date}
									isCurrentMonth={isCurrentMonth}
									isToday={isToday}
									isSelected={isSelected}
									itemCount={itemCount}
									onClick={() => handleDayClick(date, isCurrentMonth)}
								/>
							)
						})}
					</div>
				</div>

				{/* Summary */}
				{selectedDate && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="p-4 rounded-lg bg-accent space-y-2"
					>
						<p className="text-sm font-medium">Selected Date</p>
						<p className="text-xs text-muted-foreground">
							{selectedDate.toLocaleDateString('en-US', {
								weekday: 'long',
								month: 'long',
								day: 'numeric',
								year: 'numeric'
							})}
						</p>
						<p className="text-xs text-muted-foreground">
							{todoCounts[selectedDate.toDateString()] || 0} items due
						</p>
					</motion.div>
				)}
			</div>
		</motion.aside>
	)
}