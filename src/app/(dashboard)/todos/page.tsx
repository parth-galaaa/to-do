'use client'

import { useState } from 'react'
import TodoList from '@/components/todos/todo-list'
import ListsSidebar from '@/components/lists/lists-sidebar'
import CalendarView from '@/components/calendar/calendar-view'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { List as ListIcon, Calendar as CalendarIcon, X } from 'lucide-react'

export default function TodosPage() {
  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showCalendar, setShowCalendar] = useState(false)

  return (
    <>
      {/* Mobile Header with Menu - Only visible on mobile */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
        {/* Lists Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <ListIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Lists Menu</SheetTitle>
            </SheetHeader>
            <ListsSidebar
              selectedListId={selectedListId}
              onSelectList={(listId) => {
                setSelectedListId(listId)
              }}
            />
          </SheetContent>
        </Sheet>

        <h1 className="text-lg font-semibold">Todos</h1>

        {/* Calendar Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <CalendarIcon className="h-5 w-5" />
        </Button>
      </div>

      {/* Desktop & Mobile Layouts */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-7rem)] md:h-[calc(100vh-4rem)] overflow-hidden">
        {/* Lists Sidebar - 20% width, hidden on mobile */}
        <div className="hidden md:block md:w-[20%] md:min-w-[250px]">
          <ListsSidebar
            selectedListId={selectedListId}
            onSelectList={(listId) => {
              setSelectedListId(listId)
              setSelectedDate(null) // Clear date filter when switching lists
            }}
            className="h-full"
          />
        </div>

        {/* Main content area - 60% width on desktop, full width on mobile */}
        <main className="flex-1 md:w-[60%] overflow-y-auto">
          <div className="container max-w-full px-3 md:px-8 py-3 md:py-8">
            <TodoList
              selectedListId={selectedListId}
              selectedDate={selectedDate}
              onClearDateFilter={() => setSelectedDate(null)}
            />
          </div>
        </main>

        {/* Calendar - 20% width, hidden on mobile unless toggled */}
        <div className={`
          ${showCalendar ? 'block' : 'hidden'} 
          md:block md:w-[20%] md:min-w-[280px]
          fixed md:relative
          right-0 top-0
          h-full
          w-[90%] sm:w-[400px]
          z-50
          shadow-2xl md:shadow-none
          bg-card
        `}>
          {/* Close button for mobile */}
          <div className="md:hidden absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowCalendar(false)}
              className="h-8 w-8"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <CalendarView
            selectedDate={selectedDate}
            onDateSelect={(date) => {
              setSelectedDate(date)
              setShowCalendar(false) // Close calendar on mobile after selection
            }}
            className="h-full"
          />
        </div>
      </div>

      {/* Overlay for mobile calendar */}
      {showCalendar && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowCalendar(false)}
        />
      )}
    </>
  )
}