import { format, isToday, isTomorrow, isYesterday, isPast, isFuture, startOfDay } from 'date-fns'

export function formatDueDate(dateString: string | null): string {
	if (!dateString) return 'No due date'

	const date = new Date(dateString)

	if (isToday(date)) return 'Today'
	if (isTomorrow(date)) return 'Tomorrow'
	if (isYesterday(date)) return 'Yesterday'

	return format(date, 'MMM d, yyyy')
}

export function formatDateShort(dateString: string | null): string {
	if (!dateString) return ''
	return format(new Date(dateString), 'MMM d')
}

export function formatDateLong(dateString: string | null): string {
	if (!dateString) return ''
	return format(new Date(dateString), 'MMMM d, yyyy')
}

export function isOverdue(dateString: string | null): boolean {
	if (!dateString) return false
	const date = startOfDay(new Date(dateString))
	const today = startOfDay(new Date())
	return date < today
}

export function isDueToday(dateString: string | null): boolean {
	if (!dateString) return false
	return isToday(new Date(dateString))
}

export function isDueSoon(dateString: string | null): boolean {
	if (!dateString) return false
	const date = new Date(dateString)
	return isFuture(date) && !isToday(date) && !isTomorrow(date)
}

export function getDateColor(dateString: string | null): string {
	if (!dateString) return 'text-muted-foreground'

	if (isOverdue(dateString)) return 'text-red-500'
	if (isDueToday(dateString)) return 'text-amber-500'
	if (isTomorrow(new Date(dateString))) return 'text-blue-500'

	return 'text-muted-foreground'
}

export function getDaysInMonth(year: number, month: number): Date[] {
	const firstDay = new Date(year, month, 1)
	const lastDay = new Date(year, month + 1, 0)
	const days: Date[] = []

	for (let day = 1; day <= lastDay.getDate(); day++) {
		days.push(new Date(year, month, day))
	}

	return days
}

export function getMonthName(month: number): string {
	return format(new Date(2000, month, 1), 'MMMM')
}

export function isSameDay(date1: Date, date2: Date): boolean {
	return startOfDay(date1).getTime() === startOfDay(date2).getTime()
}