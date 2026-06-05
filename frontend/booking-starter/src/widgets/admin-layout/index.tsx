import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bell,
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  ChevronDown,
  HelpCircle,
  LogOut,
  Menu,
  Settings,
  SquareCheckBig,
  X,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/shared/lib/utils";

function OwnerAvatar({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={cn(
        "rounded-full bg-[#f3f7fb]",
        className
      )}
    >
      <circle cx="20" cy="20" r="20" fill="#f3f7fb" />
      <path
        d="M9 23.5h22v5.2A10.5 10.5 0 0 1 20.5 39h-1A10.5 10.5 0 0 1 9 28.7v-5.2Z"
        fill="#18a999"
      />
      <path
        d="M11.5 11.8A8.5 8.5 0 0 1 20 3.3a8.5 8.5 0 0 1 8.5 8.5v13h-17v-13Z"
        fill="#ffb36b"
      />
      <circle cx="16.5" cy="15.5" r="1" fill="#0f172a" />
      <circle cx="23.5" cy="15.5" r="1" fill="#0f172a" />
      <path d="M15 25h10" stroke="#0f172a" strokeWidth="1.5" />
    </svg>
  );
}

const navItems = [
  {
    label: "Предстоящие встречи",
    to: "/admin",
    isLink: true,
    icon: CalendarCheck,
  },
  {
    label: "Типы событий",
    to: "/admin/event-types",
    isLink: true,
    icon: SquareCheckBig,
  },
  {
    label: "Страница бронирования",
    to: "#",
    isLink: false,
    icon: CalendarRange,
  },
  { label: "Настройки", to: "#", isLink: false, icon: Settings },
];

const bottomItems = [
  { label: "Помощь", icon: HelpCircle },
  { label: "Выйти", icon: LogOut },
];

function SidebarIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />;
}

function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const { pathname } = useLocation();

  return (
    <>
      <div className="flex h-16 items-center gap-2 border-b border-border px-8">
        <CalendarDays className="h-6 w-6 text-primary" aria-hidden="true" />
        <span className="text-xl font-bold tracking-tight text-foreground">
          Calendar
        </span>
      </div>

      <nav aria-label="Админка" className="flex-1 space-y-3 px-5 py-6">
        {navItems.map((item) => {
          const isActive = item.isLink && pathname === item.to;
          const baseClasses =
            "flex h-12 items-center gap-4 rounded-md px-4 text-sm font-semibold transition-colors";
          const activeClasses = "bg-primary/10 text-primary shadow-sm";
          const inactiveClasses =
            "text-muted-foreground hover:bg-muted hover:text-foreground";
          const staticClasses =
            "text-muted-foreground cursor-default select-none";

          if (item.isLink) {
            return (
              <Link
                key={item.label}
                to={item.to}
                className={cn(
                  baseClasses,
                  isActive ? activeClasses : inactiveClasses
                )}
                aria-current={isActive ? "page" : undefined}
                onClick={onItemClick}
              >
                <SidebarIcon icon={item.icon} />
                {item.label}
              </Link>
            );
          }

          return (
            <div
              key={item.label}
              className={cn(baseClasses, staticClasses)}
              aria-hidden="true"
            >
              <SidebarIcon icon={item.icon} />
              {item.label}
            </div>
          );
        })}
      </nav>

      <div className="mx-5 space-y-3 border-t border-border py-6">
        {bottomItems.map((item) => (
          <div
            key={item.label}
            className="flex h-11 cursor-default select-none items-center gap-4 rounded-md px-4 text-sm font-semibold text-muted-foreground"
            aria-hidden="true"
          >
            <SidebarIcon icon={item.icon} />
            {item.label}
          </div>
        ))}
      </div>
    </>
  );
}

function AdminSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-full w-[280px] flex-col border-r border-border bg-card lg:flex">
      <SidebarContent />
    </aside>
  );
}

function AdminMobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col border-r border-border bg-card transition-transform duration-300 ease-in-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-end px-4 pt-4">
          <button
            className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground"
            onClick={onClose}
            aria-label="Закрыть меню"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <SidebarContent onItemClick={onClose} />
      </div>
    </>
  );
}

function AdminTopbar({
  ownerName,
  onMenuClick,
}: {
  ownerName: string;
  onMenuClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur-sm lg:px-8">
      <button
        className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground lg:hidden"
        onClick={onMenuClick}
        aria-label="Открыть меню"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-6">
        <div className="relative text-foreground" aria-hidden="true">
          <Bell className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="flex items-center gap-3 text-foreground">
          <OwnerAvatar className="h-9 w-9" />
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-semibold">{ownerName}</span>
            <span className="text-xs text-muted-foreground">Host</span>
          </div>
          <ChevronDown
            className="h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
      </div>
    </header>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const ownerName = "Tota";
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <AdminMobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="lg:ml-[280px]">
        <AdminTopbar
          ownerName={ownerName}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="px-4 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
