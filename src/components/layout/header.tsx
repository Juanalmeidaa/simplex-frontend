"use client";

import { useAuthStore, useUIStore } from "@/store";
import { Bell, LogOut, Menu, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { DateFormatter } from "@/shared/formatters";

const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transacoes": "Transações",
  "/relatorios": "Relatórios",
  "/configuracoes": "Configurações",
};

export function Header() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const router = useRouter();
  const pathname = usePathname();

  const currentPage = PAGE_LABELS[pathname] || "Dashboard";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header
      className={cn(
        "fixed right-0 top-0 z-30 border-b bg-background/80 backdrop-blur-xl duration-200 ease-out",
        sidebarOpen ? "left-64" : "left-20"
      )}
    >
      <div className="flex h-[72px] items-center justify-between px-8">
        <div className="flex items-center gap-5">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex flex-col">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {currentPage}
            </span>
            <h1 className="text-xl font-bold tracking-tight">
              Olá, <span className="text-primary">{user?.name?.split(" ")[0] || "Usuário"}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="mr-4 text-sm text-muted-foreground">
            {DateFormatter.format(new Date())}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="ml-2 h-10 gap-3 rounded-xl px-3 hover:bg-primary/10"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{user?.name}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/configuracoes")} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
