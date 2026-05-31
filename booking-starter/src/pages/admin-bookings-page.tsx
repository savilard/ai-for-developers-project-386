import { useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Inbox,
  X,
  type LucideIcon,
} from "lucide-react";

import { listUpcomingBookings } from "@/shared/api";
import type {
  AdminBookingListResponse,
  Booking,
  BookingStatus,
  BookingSummary,
  GuestContact,
  PaginationMeta,
} from "@/shared/api/types";
import { cn } from "@/shared/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";
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

type StatusFilter = "all" | BookingStatus;

const EMPTY_SUMMARY: BookingSummary = {
  total: 0,
  confirmed: 0,
  pending: 0,
  cancelled: 0,
};

const EMPTY_PAGINATION: PaginationMeta = {
  page: 1,
  pageSize: 8,
  totalItems: 0,
  totalPages: 1,
};

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

function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
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

function AdminBookingsLoading() {
  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card
            key={index}
            className="rounded-xl border-border bg-card shadow-sm"
          >
            <CardContent className="flex items-center gap-5 p-6">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-10" />
                <Skeleton className="h-4 w-28" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-[#e8edf4] bg-card shadow-sm">
        <div className="space-y-0">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="grid h-[72px] grid-cols-[250px_280px_310px_210px] items-center gap-0 border-b border-[#eef2f7] px-5"
            >
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function AdminBookingsError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Alert variant="destructive" className="border-destructive/30">
      <AlertTitle>Не удалось загрузить встречи</AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Повторить
        </Button>
      </AlertDescription>
    </Alert>
  );
}

function FiltersBar({
  weekRange,
  periodStart,
  onSelectPeriodDate,
  onPreviousWeek,
  onNextWeek,
  statusFilter,
  onStatusFilterChange,
}: {
  weekRange: string;
  periodStart: Date;
  onSelectPeriodDate: (date: Date) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: string) => void;
}) {
  const [periodOpen, setPeriodOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={onPreviousWeek}
            aria-label="Предыдущая неделя"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Popover open={periodOpen} onOpenChange={setPeriodOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-10 min-w-[274px] justify-start bg-card px-4 text-sm font-medium text-foreground shadow-sm"
              >
                <CalendarDays
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <span>{weekRange}</span>
                <ChevronDown
                  className="ml-auto h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={periodStart}
                defaultMonth={periodStart}
                onSelect={(date) => {
                  if (date) {
                    onSelectPeriodDate(date);
                    setPeriodOpen(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={onNextWeek}
            aria-label="Следующая неделя"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
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

function StatusBadge({ status }: { status: BookingStatus }) {
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

function EventCell({ booking }: { booking: Booking }) {
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

function BookingsTable({ bookings }: { bookings: Booking[] }) {
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
          <TableRow
            key={booking.id}
            className="h-[72px] border-[#eef2f7] hover:bg-muted/20"
          >
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

function BookingMobileCard({ booking }: { booking: Booking }) {
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
  const [periodStart, setPeriodStart] = useState(() =>
    getStartOfWeek(new Date())
  );
  const [periodEnd, setPeriodEnd] = useState(() => getEndOfWeek(new Date()));
  const [data, setData] = useState<AdminBookingListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    let ignore = false;

    async function loadBookings() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await listUpcomingBookings({
          from: periodStart.toISOString(),
          to: periodEnd.toISOString(),
          ...(statusFilter !== "all" ? { status: statusFilter } : {}),
          page,
          pageSize,
        });

        if (!ignore) {
          setData(response);
          if (
            response.pagination.totalPages > 0 &&
            page > response.pagination.totalPages
          ) {
            setPage(response.pagination.totalPages);
          }
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Проверьте соединение с API и попробуйте еще раз."
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadBookings();

    return () => {
      ignore = true;
    };
  }, [page, pageSize, periodEnd, periodStart, reloadKey, statusFilter]);

  const bookings = data?.bookings ?? [];
  const summary = data?.summary ?? EMPTY_SUMMARY;
  const pagination = data?.pagination ?? {
    ...EMPTY_PAGINATION,
    page,
    pageSize,
  };
  const hasNoBookings = !isLoading && !errorMessage && summary.total === 0;
  const hasNoFilteredBookings =
    !isLoading && !errorMessage && summary.total > 0 && bookings.length === 0;

  function handleStatusFilterChange(value: string) {
    setStatusFilter(value as StatusFilter);
    setPage(1);
  }

  function handleSelectPeriodDate(date: Date) {
    setPeriodStart(getStartOfWeek(date));
    setPeriodEnd(getEndOfWeek(date));
    setPage(1);
  }

  function handlePreviousWeek() {
    const previousWeek = addWeeks(periodStart, -1);
    setPeriodStart(getStartOfWeek(previousWeek));
    setPeriodEnd(getEndOfWeek(previousWeek));
    setPage(1);
  }

  function handleNextWeek() {
    const nextWeek = addWeeks(periodStart, 1);
    setPeriodStart(getStartOfWeek(nextWeek));
    setPeriodEnd(getEndOfWeek(nextWeek));
    setPage(1);
  }

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPage(1);
  }

  function handleRetry() {
    setReloadKey((key) => key + 1);
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
        weekRange={formatDateRange(periodStart, periodEnd)}
        periodStart={periodStart}
        onSelectPeriodDate={handleSelectPeriodDate}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
      />

      {isLoading ? (
        <AdminBookingsLoading />
      ) : errorMessage ? (
        <AdminBookingsError message={errorMessage} onRetry={handleRetry} />
      ) : hasNoBookings ? (
        <AdminBookingsEmpty />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              label="Встреч на этой неделе"
              value={summary.total}
              icon={CalendarDays}
              tone="blue"
            />
            <StatsCard
              label="Подтверждено"
              value={summary.confirmed}
              icon={Check}
              tone="green"
            />
            <StatsCard
              label="Ожидают"
              value={summary.pending}
              icon={Clock3}
              tone="orange"
            />
            <StatsCard
              label="Отменено"
              value={summary.cancelled}
              icon={X}
              tone="slate"
            />
          </div>

          {hasNoFilteredBookings ? (
            <AdminBookingsFilteredEmpty />
          ) : (
            <>
              <div className="hidden lg:block">
                <div className="overflow-hidden rounded-xl border border-[#e8edf4] bg-card shadow-sm">
                  <BookingsTable bookings={bookings} />
                  <PaginationControls
                    page={page}
                    pageSize={pagination.pageSize}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    onPageChange={setPage}
                    onPageSizeChange={handlePageSizeChange}
                  />
                </div>
              </div>

              <div className="lg:hidden space-y-4">
                {bookings.map((booking) => (
                  <BookingMobileCard key={booking.id} booking={booking} />
                ))}
                <PaginationControls
                  page={page}
                  pageSize={pagination.pageSize}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalItems}
                  onPageChange={setPage}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
