import { Outlet, useLocation } from "react-router-dom"

import { AppHeader } from "@/widgets/app-header"
import { AdminShell } from "@/widgets/admin-layout"

export function AppLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === "/"
  const isAdmin = pathname.startsWith("/admin")

  return (
    <div className="min-h-screen bg-background">
      {!isAdmin && <AppHeader />}
      {isAdmin ? (
        <AdminShell>
          <Outlet />
        </AdminShell>
      ) : (
        <main
          className={
            isHome
              ? "min-w-0"
              : "mx-auto max-w-4xl px-4 py-8"
          }
        >
          <Outlet />
        </main>
      )}
    </div>
  )
}
