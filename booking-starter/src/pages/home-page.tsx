import { Link } from "react-router-dom"
import { ArrowRight, CalendarDays, CheckCircle2 } from "lucide-react"

import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"

export function HomePage() {
  return (
    <div
      className="min-h-[calc(100vh-60px)]"
      style={{
        background:
          "radial-gradient(circle at 12% 18%, rgba(191, 219, 254, 0.72), transparent 34%), radial-gradient(circle at 82% 14%, rgba(255, 237, 213, 0.95), transparent 30%), linear-gradient(180deg, #f8fafc 0%, #f7f8fb 100%)",
      }}
    >
      <div className="mx-auto max-w-5xl px-6 py-12 md:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left column - Hero text */}
          <div className="flex flex-col gap-6">
            <Badge variant="outline">БЫСТРАЯ ЗАПИСЬ НА ЗВОНОК</Badge>

            <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-[48px] lg:leading-[1.1]">
              Calendar
            </h1>

            <p className="text-lg leading-relaxed text-muted-foreground">
              Забронируйте встречу за минуту: выберите тип события и удобное время.
            </p>

            <Link to="/book" className="self-start">
              <Button size="lg" className="group gap-2 shadow-[0_8px_18px_rgba(255,107,26,0.22)]">
                Записаться
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {/* Right column - Features card */}
          <div className="flex items-start lg:items-center">
            <Card className="w-full border border-border shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Возможности
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Выбор типа события и удобного времени для встречи.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Быстрое бронирование с подтверждением и дополнительными заметками.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Управление типами встреч и просмотр предстоящих записей в админке.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
