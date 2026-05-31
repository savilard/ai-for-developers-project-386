import { useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Inbox,
  X,
  type LucideIcon,
} from "lucide-react";

import type { Booking, BookingStatus, GuestContact } from "@/shared/api/types";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Separator } from "@/shared/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

type AdminBookingStatus = BookingStatus | "pending" | "cancelled";
type StatusFilter = "all" | AdminBookingStatus;
type AdminBooking = Omit<Booking, "status"> & { status: AdminBookingStatus };

/* ------------------------------------------------------------------ */
/*  Date helpers                                                      */
/* ------------------------------------------------------------------ */

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday …
  const diffToMonday = (day + 6) % 7;
  d.setDate(d.getDate() - diffToMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEndOfWeek(date: Date): Date {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}

function isSameLocalDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateRange(start: Date, end: Date): string {
  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonth = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
  }).format(start);
  const endMonth = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
  }).format(end);
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  if (startYear !== endYear) {
    return `${startDay} ${startMonth} ${startYear} — ${endDay} ${endMonth} ${endYear}`;
  }
  if (startMonth === endMonth) {
    return `${startDay} — ${endDay} ${startMonth} ${startYear}`;
  }
  return `${startDay} ${startMonth} — ${endDay} ${endMonth} ${startYear}`;
}

function formatDateShort(date: Date): string {
  const formatted = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    weekday: "short",
  }).format(date);
  return formatted
    .replace(", вт.", ", вт")
    .replace(", пт.", ", пт")
    .replace(", ср.", ", ср")
    .replace(", пн.", ", пн")
    .replace(", чт.", ", чт")
    .replace(", сб.", ", сб")
    .replace(", вс.", ", вс");
}

function formatDatePrimary(date: Date): string {
  const today = new Date();
  if (isSameLocalDate(date, today)) {
    return "Сегодня";
  }
  return formatDateShort(date);
}

function formatTimeRange(startAt: string, endAt: string): string {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const fmt = new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

function getDurationMinutes(startAt: string, endAt: string): number {
  return Math.round(
    (new Date(endAt).getTime() - new Date(startAt).getTime()) / 60000
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function sortBookingsByStartAt(bookings: AdminBooking[]): AdminBooking[] {
  return [...bookings].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  );
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                         */
/* ------------------------------------------------------------------ */

function mockIso(dayOffset: number, hour: number, minute: number): string {
  const d = getStartOfWeek(new Date());
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function makeMockBooking({
  id,
  day,
  start,
  end,
  title,
  name,
  email,
  status,
}: {
  id: string;
  day: number;
  start: [number, number];
  end: [number, number];
  title: string;
  name: string;
  email: string;
  status: AdminBookingStatus;
}): AdminBooking {
  return {
    id,
    eventTypeId: title.toLowerCase().replaceAll(" ", "-"),
    eventTypeTitle: title,
    guest: { name, email },
    startAt: mockIso(day, start[0], start[1]),
    endAt: mockIso(day, end[0], end[1]),
    status,
    createdAt: mockIso(Math.max(day - 2, 0), 8, 30),
  };
}

const MOCK_BOOKINGS: AdminBooking[] = [
  makeMockBooking({
    id: "b1",
    day: 0,
    start: [9, 0],
    end: [9, 15],
    title: "Знакомство",
    name: "Алексей К.",
    email: "alexey@example.com",
    status: "confirmed",
  }),
  makeMockBooking({
    id: "b2",
    day: 0,
    start: [10, 30],
    end: [11, 0],
    title: "Консультация",
    name: "Мария С.",
    email: "maria@example.com",
    status: "confirmed",
  }),
  makeMockBooking({
    id: "b3",
    day: 0,
    start: [14, 0],
    end: [14, 15],
    title: "Разбор проекта",
    name: "Дмитрий П.",
    email: "dmitry@example.com",
    status: "pending",
  }),
  makeMockBooking({
    id: "b4",
    day: 1,
    start: [9, 0],
    end: [9, 30],
    title: "Звонок",
    name: "Екатерина И.",
    email: "kate@example.com",
    status: "confirmed",
  }),
  makeMockBooking({
    id: "b5",
    day: 1,
    start: [11, 0],
    end: [12, 0],
    title: "Демо",
    name: "Сергей В.",
    email: "sergey@example.com",
    status: "confirmed",
  }),
  makeMockBooking({
    id: "b6",
    day: 2,
    start: [15, 30],
    end: [15, 45],
    title: "Знакомство",
    name: "Анна Н.",
    email: "anna@example.com",
    status: "cancelled",
  }),
  makeMockBooking({
    id: "b7",
    day: 3,
    start: [10, 0],
    end: [10, 30],
    title: "Консультация",
    name: "Иван П.",
    email: "ivan@example.com",
    status: "confirmed",
  }),
  makeMockBooking({
    id: "b8",
    day: 3,
    start: [16, 0],
    end: [16, 15],
    title: "Разбор проекта",
    name: "Ольга Л.",
    email: "olga@example.com",
    status: "pending",
  }),
  makeMockBooking({
    id: "b9",
    day: 4,
    start: [9, 0],
    end: [9, 30],
    title: "Звонок",
    name: "Никита Р.",
    email: "nikita@example.com",
    status: "confirmed",
  }),
  makeMockBooking({
    id: "b10",
    day: 4,
    start: [11, 30],
    end: [12, 0],
    title: "Демо",
    name: "Виктория М.",
    email: "victoria@example.com",
    status: "confirmed",
  }),
  makeMockBooking({
    id: "b11",
    day: 4,
    start: [13, 0],
    end: [13, 15],
    title: "Знакомство",
    name: "Павел А.",
    email: "pavel@example.com",
    status: "confirmed",
  }),
  makeMockBooking({
    id: "b12",
    day: 4,
    start: [15, 0],
    end: [16, 0],
    title: "Консультация",
    name: "Дарья Б.",
    email: "daria@example.com",
    status: "cancelled",
  }),
  makeMockBooking({
    id: "b13",
    day: 5,
    start: [9, 30],
    end: [9, 45],
    title: "Разбор проекта",
    name: "Михаил Г.",
    email: "mikhail@example.com",
    status: "confirmed",
  }),
  makeMockBooking({
    id: "b14",
    day: 5,
    start: [10, 30],
    end: [11, 0],
    title: "Звонок",
    name: "Ксения Д.",
    email: "ksenia@example.com",
    status: "confirmed",
  }),
  makeMockBooking({
    id: "b15",
    day: 5,
    start: [12, 0],
    end: [12, 30],
    title: "Демо",
    name: "Артём Е.",
    email: "artem@example.com",
    status: "pending",
  }),
  makeMockBooking({
    id: "b16",
    day: 5,
    start: [14, 0],
    end: [15, 0],
    title: "Знакомство",
    name: "Полина Ж.",
    email: "polina@example.com",
    status: "confirmed",
  }),
  makeMockBooking({
    id: "b17",
    day: 5,
    start: [16, 30],
    end: [17, 0],
    title: "Консультация",
    name: "Роман З.",
    email: "roman@example.com",
    status: "confirmed",
  }),
  makeMockBooking({
    id: "b18",
    day: 6,
    start: [9, 0],
    end: [9, 15],
    title: "Разбор проекта",
    name: "Лилия К.",
    email: "lilia@example.com",
    status: "cancelled",
  }),
  makeMockBooking({
    id: "b19",
    day: 6,
    start: [10, 0],
    end: [10, 30],
    title: "Звонок",
    name: "Георгий Л.",
    email: "georgy@example.com",
    status: "confirmed",
  }),
  makeMockBooking({
    id: "b20",
    day: 6,
    start: [11, 0],
    end: [12, 0],
    title: "Демо",
    name: "Юлия М.",
    email: "yulia@example.com",
    status: "confirmed",
  }),
  makeMockBooking({
    id: "b21",
    day: 6,
    start: [13, 0],
    end: [13, 30],
    title: "Знакомство",
    name: "Денис Н.",
    email: "denis@example.com",
    status: "pending",
  }),
  makeMockBooking({
    id: "b22",
    day: 6,
    start: [14, 0],
    end: [14, 30],
    title: "Консультация",
    name: "Алина О.",
    email: "alina@example.com",
    status: "confirmed",
  }),
  makeMockBooking({
    id: "b23",
    day: 6,
    start: [15, 0],
    end: [15, 15],
    title: "Разбор проекта",
    name: "Борис П.",
    email: "boris@example.com",
    status: "confirmed",
  }),
  makeMockBooking({
    id: "b24",
    day: 6,
    start: [16, 0],
    end: [16, 30],
    title: "Звонок",
    name: "Татьяна Р.",
    email: "tatyana@example.com",
    status: "cancelled",
  }),
];

/* ------------------------------------------------------------------ */
/*  UI pieces                                                         */
/* ------------------------------------------------------------------ */

function AdminBookingsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
      <CalendarDays
        className="mx-auto h-10 w-10 text-muted-foreground mb-4"
        aria-hidden="true"
      />
      <h3 className="text-lg font-semibold mb-1">
        Предстоящих встреч пока нет
      </h3>
      <p className="text-sm text-muted-foreground">
        Когда гости забронируют время, встречи появятся здесь.
      </p>
    </div>
  );
}

function AdminBookingsFilteredEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
      <Inbox
        className="mx-auto h-10 w-10 text-muted-foreground mb-4"
        aria-hidden="true"
      />
      <h3 className="text-lg font-semibold mb-1">
        За выбранный период встреч нет
      </h3>
      <p className="text-sm text-muted-foreground">
        Попробуйте изменить фильтр периода.
      </p>
    </div>
  );
}

function FiltersBar({
  weekRange,
  statusFilter,
  onStatusFilterChange,
}: {
  weekRange: string;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="inline-flex h-10 items-center gap-3 rounded-md border border-input bg-card px-4 text-sm font-medium text-foreground shadow-sm">
          <CalendarDays
            className="h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <span>{weekRange}</span>
          <ChevronRight
            className="h-4 w-4 rotate-90 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="h-10 w-full bg-card shadow-sm sm:w-[184px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="confirmed">Подтверждено</SelectItem>
            <SelectItem value="pending">Ожидают</SelectItem>
            <SelectItem value="cancelled">Отменено</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="hidden sm:block" aria-hidden="true" />
    </div>
  );
}

function StatsCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: "blue" | "green" | "orange" | "slate";
}) {
  const toneClassName = {
    blue: "bg-sky-100 text-sky-500",
    green: "bg-emerald-100 text-emerald-600",
    orange: "bg-orange-100 text-orange-500",
    slate: "bg-slate-100 text-slate-500",
  }[tone];

  return (
    <Card className="rounded-xl border-border bg-card shadow-sm">
      <CardContent className="flex items-center gap-5 p-6">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            toneClassName
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-3xl font-bold leading-none text-foreground">
            {value}
          </p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: AdminBookingStatus }) {
  if (status === "confirmed") {
    return (
      <Badge className="border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50">
        Подтверждено
      </Badge>
    );
  }
  if (status === "pending") {
    return (
      <Badge className="border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-500 hover:bg-orange-50">
        Ожидает подтверждения
      </Badge>
    );
  }
  return (
    <Badge className="border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-50">
      Отменено
    </Badge>
  );
}

function CustomerCell({ guest }: { guest: GuestContact }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground">
        {getInitials(guest.name)}
      </div>
      <div>
        <div className="font-semibold text-foreground">{guest.name}</div>
        <div className="text-sm text-muted-foreground">{guest.email}</div>
      </div>
    </div>
  );
}

function DateTimeCell({
  startAt,
  endAt,
}: {
  startAt: string;
  endAt: string;
}) {
  const date = new Date(startAt);
  const today = new Date();
  const isToday = isSameLocalDate(date, today);
  return (
    <div className="grid grid-cols-[104px_96px] items-center gap-5">
      <div className="space-y-1">
        <div className="font-semibold text-foreground">
          {formatDatePrimary(date)}
        </div>
        {isToday && (
          <div className="text-xs text-muted-foreground">
            {formatDateShort(date)}
          </div>
        )}
      </div>
      <div className="text-sm font-medium text-muted-foreground">
        {formatTimeRange(startAt, endAt)}
      </div>
    </div>
  );
}

function EventCell({ booking }: { booking: AdminBooking }) {
  const duration = getDurationMinutes(booking.startAt, booking.endAt);
  return (
    <div className="space-y-0.5">
      <div className="font-semibold text-foreground">
        {booking.eventTypeTitle}
      </div>
      <div className="text-sm text-muted-foreground">{duration} мин</div>
    </div>
  );
}

function BookingsTable({ bookings }: { bookings: AdminBooking[] }) {
  return (
    <Table className="min-w-[900px] table-fixed">
      <TableHeader>
        <TableRow className="border-[#eef2f7] bg-muted/30 hover:bg-muted/30">
          <TableHead className="h-11 w-[250px] px-5 text-xs font-bold text-muted-foreground">
            Дата и время
          </TableHead>
          <TableHead className="h-11 w-[280px] px-5 text-xs font-bold text-muted-foreground">
            Событие
          </TableHead>
          <TableHead className="h-11 w-[310px] px-5 text-xs font-bold text-muted-foreground">
            Клиент
          </TableHead>
          <TableHead className="h-11 w-[210px] px-5 text-xs font-bold text-muted-foreground">
            Статус
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.id} className="h-[72px] border-[#eef2f7] hover:bg-muted/20">
            <TableCell className="px-5 py-3">
              <DateTimeCell startAt={booking.startAt} endAt={booking.endAt} />
            </TableCell>
            <TableCell className="px-5 py-3">
              <EventCell booking={booking} />
            </TableCell>
            <TableCell className="px-5 py-3">
              <CustomerCell guest={booking.guest} />
            </TableCell>
            <TableCell className="px-5 py-3">
              <StatusBadge status={booking.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function BookingMobileCard({ booking }: { booking: AdminBooking }) {
  const date = new Date(booking.startAt);
  const duration = getDurationMinutes(booking.startAt, booking.endAt);
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="font-medium">{formatDatePrimary(date)}</div>
            <div className="text-sm text-muted-foreground">
              {formatTimeRange(booking.startAt, booking.endAt)}
            </div>
          </div>
          <StatusBadge status={booking.status} />
        </div>
        <Separator />
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Событие
          </span>
          <div className="font-medium mt-0.5">{booking.eventTypeTitle}</div>
          <div className="text-sm text-muted-foreground">{duration} мин</div>
        </div>
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Клиент
          </span>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold">
              {getInitials(booking.guest.name)}
            </div>
            <div>
              <div className="text-sm font-medium">{booking.guest.name}</div>
              <div className="text-xs text-muted-foreground">
                {booking.guest.email}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PaginationControls({
  page,
  pageSize,
  totalPages,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-border px-5 py-4 sm:flex-row">
      <div className="text-sm font-medium text-muted-foreground">
        Показано {start} – {end} из {totalItems}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Предыдущая страница"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="icon-sm"
                onClick={() => onPageChange(p)}
                aria-label={`Страница ${p}`}
                aria-current={p === page ? "true" : undefined}
              >
                {p}
              </Button>
            ))}
          </div>
        )}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Следующая страница"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Select
          value={String(pageSize)}
          onValueChange={(v) => onPageSizeChange(Number(v))}
        >
          <SelectTrigger className="h-9 w-[152px] text-sm font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="8">8 на странице</SelectItem>
            <SelectItem value="10">10 на странице</SelectItem>
            <SelectItem value="20">20 на странице</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export function AdminBookingsPage() {
  const [bookings] = useState<AdminBooking[]>(MOCK_BOOKINGS);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const weekStart = useMemo(() => getStartOfWeek(new Date()), []);
  const weekEnd = useMemo(() => getEndOfWeek(new Date()), []);

  const weekBookings = useMemo(() => {
    return sortBookingsByStartAt(
      bookings.filter((b) => {
        const date = new Date(b.startAt);
        return isDateInRange(date, weekStart, weekEnd);
      })
    );
  }, [bookings, weekStart, weekEnd]);

  const filteredBookings = useMemo(() => {
    let result = weekBookings;
    if (statusFilter !== "all") {
      result = result.filter((b) => b.status === statusFilter);
    }
    return result;
  }, [weekBookings, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBookings.length / pageSize)
  );
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const visibleBookings = filteredBookings.slice(
    startIndex,
    startIndex + pageSize
  );

  const weekCount = weekBookings.length;
  const confirmedCount = weekBookings.filter(
    (b) => b.status === "confirmed"
  ).length;
  const pendingCount = weekBookings.filter((b) => b.status === "pending").length;
  const cancelledCount = weekBookings.filter(
    (b) => b.status === "cancelled"
  ).length;

  function handleStatusFilterChange(value: string) {
    setStatusFilter(value as StatusFilter);
    setPage(1);
  }

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-[1140px] space-y-7">
      <div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight">
          Предстоящие встречи
        </h1>
        <p className="text-muted-foreground">
          Все предстоящие бронирования в одном списке.
        </p>
      </div>

      <FiltersBar
        weekRange={formatDateRange(weekStart, weekEnd)}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
      />

      {bookings.length === 0 ? (
        <AdminBookingsEmpty />
      ) : filteredBookings.length === 0 ? (
        <AdminBookingsFilteredEmpty />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              label="Встреч на этой неделе"
              value={weekCount}
              icon={CalendarDays}
              tone="blue"
            />
            <StatsCard
              label="Подтверждено"
              value={confirmedCount}
              icon={Check}
              tone="green"
            />
            <StatsCard
              label="Ожидают"
              value={pendingCount}
              icon={Clock3}
              tone="orange"
            />
            <StatsCard
              label="Отменено"
              value={cancelledCount}
              icon={X}
              tone="slate"
            />
          </div>

          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-xl border border-[#e8edf4] bg-card shadow-sm">
              <BookingsTable bookings={visibleBookings} />
              <PaginationControls
                page={safePage}
                pageSize={pageSize}
                totalPages={totalPages}
                totalItems={filteredBookings.length}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          </div>

          <div className="lg:hidden space-y-4">
            {visibleBookings.map((booking) => (
              <BookingMobileCard key={booking.id} booking={booking} />
            ))}
            <PaginationControls
              page={safePage}
              pageSize={pageSize}
              totalPages={totalPages}
              totalItems={filteredBookings.length}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </>
      )}
    </div>
  );
}
