import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, CalendarCog } from "lucide-react"

function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Стартовое приложение
        </h1>

        <div className="flex flex-wrap gap-2">
          <Badge>TypeScript</Badge>
          <Badge>Vite</Badge>
          <Badge>React</Badge>
          <Badge>Tailwind CSS</Badge>
          <Badge>shadcn/ui</Badge>
        </div>

        <Separator />

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CalendarCog className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Владелец календаря</CardTitle>
              <CardDescription>
                Управляет типами событий и просматривает бронирования.
                В MVP — единственный заранее заданный пользователь без авторизации.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>Создание типов событий</li>
                <li>Просмотр предстоящих бронирований</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Гость</CardTitle>
              <CardDescription>
                Выбирает тип события и бронирует свободный слот.
                Не требует регистрации и авторизации.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>Выбор типа события</li>
                <li>Просмотр свободных слотов на 14 дней</li>
                <li>Создание бронирования</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default App
