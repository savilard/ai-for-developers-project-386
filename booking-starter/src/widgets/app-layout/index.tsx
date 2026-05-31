import { Outlet, useLocation } from "react-router-dom"

import { AppHeader } from "@/widgets/app-header"

export function AppLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === "/"

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main
        className={
          isHome
            ? "min-w-0"
            : "mx-auto max-w-4xl px-4 py-8"
        }
      >
        <Outlet />
      </main>
    </div>
  )
}
