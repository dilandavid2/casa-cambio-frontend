"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Wallet,
  AlertTriangle,
  Repeat,
  LogOut,
  Coins,
  Menu,
  X,
} from "lucide-react";
import { api } from "@/services/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  async function logout() {
    await api.post("/auth/logout");
    router.replace("/login");
  }

  const menuItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Cuentas",
      href: "/accounts",
      icon: Wallet,
    },
    {
      label: "Operaciones",
      href: "/operations",
      icon: Repeat,
    },
    {
      label: "Monedas",
      href: "/currencies",
      icon: Coins,
    },
    {
      label: "Verificaciones",
      href: "/alerts",
      icon: AlertTriangle,
    },
  ];

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 md:hidden">
        <Image src="/logo.png" alt="Cambios Díaz" width={110} height={48} priority className="h-11 w-auto" />
        <button type="button" onClick={() => setOpen(true)} aria-label="Abrir menú" className="rounded-lg border border-zinc-700 p-2 text-white">
          <Menu size={24} />
        </button>
      </header>

      {open && <button type="button" aria-label="Cerrar menú" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-black/70 md:hidden" />}

    <aside className={`fixed inset-y-0 left-0 z-50 min-h-screen w-72 border-r border-zinc-800 bg-zinc-900 p-6 transition-transform md:static md:z-auto md:w-64 md:shrink-0 md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex justify-end md:hidden">
        <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar menú" className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-800">
          <X size={24} />
        </button>
      </div>
      <div className="p-4 flex justify-center">
        <Image
          src="/logo.png"
          alt="Cambios Díaz"
          width={180}
          height={80}
          priority
          className="h-auto"
        />
      </div>

      <nav className="space-y-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition ${
                isActive
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={logout}
        className="mt-8 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
      >
        <LogOut size={18} />
        Cerrar sesión
      </button>
    </aside>
    </>
  );
}
