import { Link, useLocation } from "react-router-dom"

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
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-semibold tracking-tight">
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
