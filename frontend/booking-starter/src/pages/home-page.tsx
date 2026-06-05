import { Link } from "react-router-dom"
import {
  ArrowRight,
  CheckCircle2,
  CalendarDays,
  Clock,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
} from "lucide-react"

import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"

function AvatarSvg() {
  return (
    <svg
      aria-hidden="true"
      className="h-10 w-10 shrink-0"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="24" fill="#f3f6fb" />
      <path d="M16 30c0-4.4 3.6-8 8-8s8 3.6 8 8v4H16v-4z" fill="#14b8a6" />
      <ellipse cx="24" cy="20" rx="7" ry="8" fill="#fbad5a" />
      <circle cx="21.5" cy="19.5" r="1.2" fill="#1f2937" />
      <circle cx="26.5" cy="19.5" r="1.2" fill="#1f2937" />
    </svg>
  )
}

function BookingPreviewCard() {
  const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
  const dates = [2, 3, 4, 5, 6, 7, 8]

  const slots = [
    { time: "09:00 – 09:30", status: "free" as const },
    { time: "09:30 – 10:00", status: "free" as const },
    { time: "10:00 – 10:30", status: "free" as const },
    { time: "10:30 – 11:00", status: "selected" as const },
    { time: "11:00 – 11:30", status: "free" as const },
    { time: "11:30 – 12:00", status: "busy" as const },
  ]

  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card shadow-xl shadow-black/[0.04]">
      <div className="grid min-w-0 md:grid-cols-2">
        {/* Left side */}
        <div className="min-w-0 space-y-3 p-4 md:border-r md:border-border xl:p-5">
          <div className="flex items-center gap-3">
            <AvatarSvg />
            <div>
              <div className="text-base font-semibold text-card-foreground">Tota</div>
              <div className="text-sm text-muted-foreground">Host</div>
            </div>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-card-foreground">Встреча 30 минут</h3>
            <Badge variant="outline">30 мин</Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            Базовый тип события для бронирования времени на встречу.
          </p>

          <div className="space-y-2.5 border-t border-border pt-3">
            <div className="flex items-center gap-3 text-sm text-card-foreground">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>30 минут</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-card-foreground">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <span>Онлайн встреча</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-card-foreground">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span>Ближайшие 14 дней</span>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="min-w-0 border-t border-border p-4 md:border-t-0 xl:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-base font-semibold text-card-foreground">Июнь 2026</h4>
            <div className="flex gap-1">
              <span
                aria-hidden="true"
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </span>
              <span
                aria-hidden="true"
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {weekdays.map((d) => (
              <div key={d} className="text-xs text-muted-foreground py-1">
                {d}
              </div>
            ))}
            {dates.map((d) => {
              const isSelected = d === 5
              return (
                <div
                  key={d}
                  className={
                    "mx-auto flex h-7 w-7 items-center justify-center rounded-full text-sm " +
                    (isSelected
                      ? "border-2 border-primary font-semibold text-primary"
                      : "text-card-foreground")
                  }
                >
                  {d}
                </div>
              )
            })}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {slots.map((slot) => {
              let classes =
                "rounded-lg border px-1.5 py-1.5 text-center text-[11px] transition-colors sm:px-2 sm:text-xs"
              if (slot.status === "selected") {
                classes += " bg-green-50 text-green-700 border-green-200 font-medium"
              } else if (slot.status === "busy") {
                classes += " bg-muted text-muted-foreground opacity-60 border-border"
              } else {
                classes += " border-border text-card-foreground"
              }
              return (
                <div key={slot.time} className={classes}>
                  {slot.time}
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
              Свободно
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/40" />
              Занято
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-primary" />
              Выбрано
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroSection() {
  return (
    <section className="home-hero-section pt-12 pb-8 md:pt-12 md:pb-8 lg:pt-8 lg:pb-4">
      <div className="grid min-w-0 items-center gap-10 lg:grid-cols-2 lg:gap-12">
        {/* Left column */}
        <div className="home-hero-copy flex min-w-0 flex-col gap-5 lg:gap-4">
          <div className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Простой способ назначить встречу
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-[43px] lg:leading-[1.1]">
            Бронируйте время для встреч легко и без переписки
          </h1>

          <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-[17px]">
            Выберите удобный тип встречи и забронируйте свободный слот в ближайшие 14 дней. Быстро, удобно и без лишних шагов.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-card-foreground">
                  Без регистрации и входа
                </div>
                <div className="text-sm text-muted-foreground">
                  Никаких аккаунтов — только нужная информация
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <CalendarDays className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-card-foreground">
                  Актуальные слоты
                </div>
                <div className="text-sm text-muted-foreground">
                  Показываем только свободное время на ближайшие 14 дней
                </div>
              </div>
            </div>
          </div>

          <Link to="/book" className="self-start w-full md:w-auto">
            <Button
              size="lg"
              className="h-12 w-full gap-2 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 md:w-[250px]"
            >
              Записаться на встречу
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Right column */}
        <div className="flex min-w-0 items-start lg:items-center">
          <BookingPreviewCard />
        </div>
      </div>
    </section>
  )
}

function BenefitCard({
  icon,
  title,
  description,
  iconBgClass,
  iconColorClass,
}: {
  icon: React.ReactNode
  title: string
  description: string
  iconBgClass: string
  iconColorClass: string
}) {
  return (
    <div className="home-benefit-card rounded-xl border border-border bg-card p-4 shadow-sm lg:p-5">
      <div
        className={`mb-4 flex h-9 w-9 items-center justify-center rounded-lg ${iconBgClass}`}
      >
        <span className={iconColorClass}>{icon}</span>
      </div>
      <h3 className="mb-2 text-base font-semibold text-card-foreground">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

function BenefitsSection() {
  return (
    <section className="home-benefits-section pt-8 pb-10 md:pt-6 md:pb-8 lg:pt-2 lg:pb-4">
      <h2 className="home-benefits-title mb-5 text-center text-2xl font-bold text-card-foreground">
        Почему это удобно
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        <BenefitCard
          icon={<CalendarDays className="h-5 w-5" />}
          title="Только свободное время"
          description="Видите только доступные слоты и бронируете в один клик."
          iconBgClass="bg-orange-50"
          iconColorClass="text-orange-500"
        />
        <BenefitCard
          icon={<User className="h-5 w-5" />}
          title="Без лишних шагов"
          description="Не нужно регистрироваться. Заполните имя и email — готово."
          iconBgClass="bg-purple-50"
          iconColorClass="text-purple-500"
        />
        <BenefitCard
          icon={<Bell className="h-5 w-5" />}
          title="Подтверждение на почту"
          description="Мы отправим письмо с деталями встречи сразу после бронирования."
          iconBgClass="bg-blue-50"
          iconColorClass="text-blue-500"
        />
      </div>
    </section>
  )
}

function HomeFooter() {
  return (
    <footer className="border-t border-border">
      <div className="home-footer-inner mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-4 sm:flex-row lg:py-3">
        <p className="text-sm text-muted-foreground">
          © 2026 Calendar. Все права защищены.
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-center">
          <a
            href="#"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Помощь
          </a>
          <a
            href="#"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Политика конфиденциальности
          </a>
        </div>
      </div>
    </footer>
  )
}

export function HomePage() {
  return (
    <div
      className="min-h-[calc(100vh-72px)] overflow-x-hidden lg:flex lg:h-[calc(100svh-72px)] lg:min-h-0 lg:flex-col"
      style={{
        background:
          "radial-gradient(circle at 12% 18%, rgba(191, 219, 254, 0.72), transparent 34%), radial-gradient(circle at 82% 14%, rgba(255, 237, 213, 0.95), transparent 30%), linear-gradient(180deg, #f8fafc 0%, #f7f8fb 100%)",
      }}
    >
      <div className="max-w-full overflow-x-hidden lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
          <HeroSection />
          <BenefitsSection />
        </div>
        <HomeFooter />
      </div>
    </div>
  )
}
