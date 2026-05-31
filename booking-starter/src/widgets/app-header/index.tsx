import { Link } from "react-router-dom"
import { CalendarDays, Lock } from "lucide-react"

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-sm">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2 text-lg font-bold tracking-tight"
        >
          <CalendarDays className="h-6 w-6 shrink-0 text-primary" />
          <span className="truncate">Calendar</span>
        </Link>
        <nav className="flex shrink-0 items-center gap-2 sm:gap-4">
          <Link
            to="/book"
            className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20 sm:px-4"
          >
            Записаться
          </Link>
          <Link
            to="/admin"
            className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Lock className="h-4 w-4" />
            Админка
          </Link>
        </nav>
      </div>
    </header>
  )
}
