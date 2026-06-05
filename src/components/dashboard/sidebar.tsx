"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Wallet,
  AlertTriangle,
  Repeat,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

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
      label: "Verificaciones",
      href: "/alerts",
      icon: AlertTriangle,
    },
  ];

  return (
    <aside className="min-h-screen w-64 border-r border-zinc-800 bg-zinc-900 p-6">
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
    </aside>
  );
}