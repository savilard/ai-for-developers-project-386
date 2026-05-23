import { Outlet } from "react-router-dom"

import { AppHeader } from "@/widgets/app-header"

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
