// @/app/dashboard/components/app-bar.tsx
import * as React from 'react'
import { type User } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'
import { MobileNav } from '@/app/dashboard/components/mobile-nav'
import { MainNav } from '@/app/dashboard/components/main-nav'
import { Profile } from '@/app/dashboard/components/profile'
import { LanguageToggle } from '@/app/dashboard/components/language-toggle'
import { ThemeToggle } from '@/app/dashboard/components/theme-toggle'
import { Notify } from '@/app/dashboard/components/notify'
import type { Notification } from '@/types/notification'

interface AppBarProps extends React.HTMLAttributes<HTMLDivElement> {
  user?: User | null
  notification?: Notification | null
}

export function AppBar({
  user,
  notification,
  className,
  ...props
}: AppBarProps) {
  return (
    <header
      className={cn(
        'supports-backdrop-blur:bg-background/60 sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur',
        className
      )}
      {...props}
    >
      <div className="container flex h-14 items-center">
        <MainNav />
        <MobileNav />
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* search or other content */}
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Notify notification={notification} />
            <Profile user={user} />
          </div>
        </div>
      </div>
    </header>
  )
}

