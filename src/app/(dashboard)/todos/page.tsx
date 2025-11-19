'use client'

import { useState, useEffect } from 'react'
import TodoList from '@/components/todos/todo-list'
import ListsSidebar from '@/components/lists/lists-sidebar'
import CalendarView from '@/components/calendar/calendar-view'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { List as ListIcon, Calendar as CalendarIcon, X } from 'lucide-react'
import { useLists } from '@/lib/hooks/use-lists'

export default function TodosPage() {
  const { lists } = useLists()
  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const selectedList = lists.find(l => l.id === selectedListId) || null

  useEffect(() => {
    if (selectedListId && !lists.find(l => l.id === selectedListId)) {
      setSelectedListId(null)
    }
  }, [lists, selectedListId])

  return (
    <>
      {/* Desktop & Mobile Layouts */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-7rem)] md:h-[calc(100vh-4rem)] overflow-hidden">

        {/* Lists Sidebar - Hidden on mobile */}
        <div className="hidden md:block md:w-[20%] md:min-w-[250px]">
          <ListsSidebar
            selectedListId={selectedListId}
            onSelectList={(listId) => {
              setSelectedListId(listId)
              setSelectedDate(null)
            }}
            className="h-full"
          />
        </div>

        {/* Main content area */}
        <main className="flex-1 md:w-[60%] overflow-y-auto relative">

          {/* UPDATED: Mobile Controls Toolbar 
              Now resides INSIDE main to flow with content. 
              Uses sticky positioning and backdrop blur for a cleaner UI. */}
          <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-2 bg-background/80 backdrop-blur-md">
            {/* Lists Menu */}
            <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground hover:text-foreground">
                  <ListIcon className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Lists</span>
                </Button>
              </SheetTrigger>
              {/* Added flex and flex-col to SheetContent to ensure structural height */}
              <SheetContent side="left" className="w-[300px] p-0 flex flex-col h-full">
                <SheetHeader className="sr-only">
                  <SheetTitle>Lists Menu</SheetTitle>
                </SheetHeader>

                {/* ADDED className="h-full" HERE */}
                <ListsSidebar
                  selectedListId={selectedListId}
                  onSelectList={(listId) => {
                    setSelectedListId(listId)
                    setShowMobileMenu(false)
                  }}
                  className="h-full"
                />
              </SheetContent>
            </Sheet>
            <Button
              variant={showCalendar ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setShowCalendar(!showCalendar)}
              className="text-muted-foreground hover:text-foreground"
            >
              <CalendarIcon className="h-5 w-5" />
            </Button>
          </div>

          <div className="container max-w-full px-3 md:px-8 py-3 md:py-8">
            <TodoList
              selectedListId={selectedListId}
              selectedList={selectedList}
              selectedDate={selectedDate}
              onClearDateFilter={() => setSelectedDate(null)}
            />
          </div>
        </main>

        {/* Calendar Sidebar */}
        <div className={`
          ${showCalendar ? 'block' : 'hidden'} 
          md:block md:w-[20%] md:min-w-[280px]
          fixed md:relative
          right-0 top-0
          h-full
          w-[85%] sm:w-[400px]
          z-50
          shadow-2xl md:shadow-none
          bg-card border-l
        `}>
          {/* Mobile Close Button */}
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
              setShowCalendar(false)
            }}
            className="h-full"
          />
        </div>
      </div>

      {/* Mobile Overlay */}
      {showCalendar && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowCalendar(false)}
        />
      )}
    </>
  )
}