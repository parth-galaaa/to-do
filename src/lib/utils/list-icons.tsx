import {
	CheckSquare,
	ShoppingCart,
	ShoppingBag,
	List,
	Clipboard,
	Briefcase,
	Home,
	Heart,
	Star,
	Target,
	Calendar,
	Book,
	Coffee,
	Film,
	Music,
	Plane,
	Gift,
	type LucideIcon
} from 'lucide-react'

export const listIcons: Record<string, LucideIcon> = {
	CheckSquare,
	ShoppingCart,
	ShoppingBag,
	List,
	Clipboard,
	Briefcase,
	Home,
	Heart,
	Star,
	Target,
	Calendar,
	Book,
	Coffee,
	Film,
	Music,
	Plane,
	Gift,
}

export const defaultListTypeIcons: Record<string, string> = {
	tasks: 'CheckSquare',
	grocery: 'ShoppingCart',
	shopping: 'ShoppingBag',
	custom: 'List',
}

export function getListIcon(iconName: string): LucideIcon {
	return listIcons[iconName] || List
}