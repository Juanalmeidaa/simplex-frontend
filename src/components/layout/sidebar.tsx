"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store";
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wallet,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transacoes", label: "Transações", icon: Receipt },
  { href: "/relatorios", label: "Relatórios", icon: PieChart },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen w-20 flex-col border-r bg-card duration-200 ease-out",
        sidebarOpen && "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Wallet className="h-8 w-8 text-primary" />
            {sidebarOpen && (
              <span className="text-xl font-bold text-primary">Simplex</span>
            )}
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  !sidebarOpen && "justify-center px-2"
                )}
              >
                <Icon className="h-5 w-5" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <button
            onClick={toggleSidebar}
            className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
