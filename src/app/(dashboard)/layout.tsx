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
        router.push('/')
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
    return null // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="bg-card/80 backdrop-blur-xl sticky top-0 z-50 shadow-md border-b border-border">
        <div className="w-full px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
          {/* Logo + Greeting */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 text-primary-foreground"
              >
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight">
              {getGreeting()}, <span className="text-primary">{profile?.display_name || 'there'}</span>! 👋
            </h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <SettingsMenu user={user} profile={profile} />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="bg-background/50">{children}</main>
    </div>
  )
}
