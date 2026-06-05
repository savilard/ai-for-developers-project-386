import { BrowserRouter, Link, Route, Routes } from "react-router-dom"

import { AppLayout } from "@/widgets/app-layout"

import { HomePage } from "@/pages/home-page"
import { EventTypesPage } from "@/pages/event-types-page"
import { BookingSlotsPage } from "@/pages/booking-slots-page"
import { BookingConfirmPage } from "@/pages/booking-confirm-page"
import { BookingSuccessPage } from "@/pages/booking-success-page"
import { AdminBookingsPage } from "@/pages/admin-bookings-page"
import { AdminEventTypesPage } from "@/pages/admin-event-types-page"

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Страница не найдена</h1>
      <Link to="/" className="text-primary underline">
        На главную
      </Link>
    </div>
  )
}

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/book" element={<EventTypesPage />} />
          <Route path="/book/:eventTypeId" element={<BookingSlotsPage />} />
          <Route path="/book/:eventTypeId/confirm" element={<BookingConfirmPage />} />
          <Route path="/book/success" element={<BookingSuccessPage />} />
          <Route path="/admin" element={<AdminBookingsPage />} />
          <Route path="/admin/event-types" element={<AdminEventTypesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
