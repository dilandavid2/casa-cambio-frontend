"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/services/api";

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(pathname === "/login");

  useEffect(() => {
    if (pathname === "/login") {
      setReady(true);
      return;
    }
    setReady(false);
    api
      .get("/auth/me")
      .then(() => setReady(true))
      .catch(() => router.replace("/login"));
  }, [pathname, router]);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-zinc-400">
        Validando sesión…
      </main>
    );
  }
  return children;
}
