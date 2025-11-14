'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getMonthName } from '@/lib/utils/date-utils'

interface CalendarHeaderProps {
	currentDate: Date
	onPreviousMonth: () => void
	onNextMonth: () => void
	onToday: () => void
}

export default function CalendarHeader({
	currentDate,
	onPreviousMonth,
	onNextMonth,
	onToday,
}: CalendarHeaderProps) {
	const monthName = getMonthName(currentDate.getMonth())
	const year = currentDate.getFullYear()

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">
					{monthName} {year}
				</h3>
				<div className="flex gap-1">
					<Button
						variant="outline"
						size="icon"
						onClick={onPreviousMonth}
						className="h-8 w-8"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						onClick={onNextMonth}
						className="h-8 w-8"
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
			<Button
				variant="outline"
				size="sm"
				onClick={onToday}
				className="w-full"
			>
				Today
			</Button>
		</div>
	)
}