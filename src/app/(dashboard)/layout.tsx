'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import SettingsMenu from '@/components/settings/settings-menu'
import { ThemeToggle } from '@/components/theme-toggle'
import { useUserProfile } from '@/lib/hooks/use-user-profile'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const { profile } = useUserProfile()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
      }
    }
    checkUser()
  }, [router, supabase])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  if (!user) {
    return null // or loading spinner
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <header className="border-b bg-background/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="w-full px-3 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo and Greeting - Extreme Left */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-linear-to-br from-primary to-primary/70 flex items-center justify-center shadow-md shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground"
                >
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <h1 className="text-sm sm:text-base md:text-xl font-bold tracking-tight">
                {getGreeting()}, {profile?.display_name || 'there'}! 👋
              </h1>
            </div>

            {/* Actions - Extreme Right */}
            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              <ThemeToggle />
              <SettingsMenu user={user} profile={profile} />
            </div>
          </div>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  )
}