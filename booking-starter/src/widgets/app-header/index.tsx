import { Link, useLocation } from "react-router-dom"
import { CalendarDays } from "lucide-react"

import { cn } from "@/shared/lib/utils"

export function AppHeader() {
  const { pathname } = useLocation()

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/"
    return pathname.startsWith(path)
  }

  const linkClass = (path: string) =>
    cn(
      "text-sm font-medium transition-colors hover:text-primary",
      isActive(path) ? "text-primary" : "text-muted-foreground"
    )

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2 text-base font-bold tracking-tight">
          <CalendarDays className="h-5 w-5 text-primary" />
          Calendar
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/book" className={linkClass("/book")}>
            Записаться
          </Link>
          <Link to="/admin" className={linkClass("/admin")}>
            Админка
          </Link>
        </nav>
      </div>
    </header>
  )
}
