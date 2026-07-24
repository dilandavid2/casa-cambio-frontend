"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { useRouter } from "next/navigation";

interface Account {
  id: number;
  name: string;
  country: string;
  balance: number;
  isActive: boolean;
  currency: {
    code: string;
    name: string;
  };
}

export function ActiveAccountsByCurrency() {
  const [accounts, setAccounts] = useState<Account[]>([]);

  const router = useRouter();

  useEffect(() => {
    async function loadAccounts() {
      try {
        const response = await api.get("/accounts");
        setAccounts(response.data || []);
      } catch (error) {
        console.error("No se pudieron cargar las cuentas", error);
      }
    }

    void loadAccounts();
  }, []);

    const grouped = accounts.reduce<Record<string, Account[]>>((acc, account) => {
        const currency = account.currency?.code || "SIN MONEDA";

        if (!acc[currency]) {
        acc[currency] = [];
        }

        acc[currency].push(account);
        return acc;
    }, {});

    const currencies = Object.keys(grouped).sort();
    function getBalanceDot(balance: number) {
        if (balance <= 0) return "bg-red-500";
        if (balance < 1000) return "bg-yellow-500";
        return "bg-green-500";
    }

    return (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h3 className="mb-4 text-lg font-semibold">Cuentas activas por moneda</h3>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {currencies.map((currency) => {
                const totalCurrency = grouped[currency].reduce(
                    (sum, account) => sum + account.balance,
                    0
                );

                return (
            <div
                key={currency}
                className="rounded-lg border border-zinc-800 bg-zinc-950 p-4"
            >
                <p className="mb-4 text-sm text-zinc-400">
                    Total:{" "}
                    <span className="font-semibold text-white">
                        {totalCurrency.toLocaleString("es-CO")}
                    </span>
                </p>

                <div className="space-y-3">
                {grouped[currency]
                    .sort((a, b) => b.balance - a.balance)
                    .map((account) => (
                        <div
                            key={account.id}
                            onClick={() => router.push(`/accounts/${account.id}`)}
                            className="cursor-pointer rounded-lg border-b border-zinc-800 p-2 transition last:border-0 hover:bg-zinc-900"
                        >
                        <div className="flex justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`h-2.5 w-2.5 rounded-full ${getBalanceDot(account.balance)}`}
                                />
                                <p className="font-medium">{account.name}</p>
                                </div>
                            <p className="text-xs text-zinc-400">
                            {account.country}
                            </p>
                        </div>

                        <p className="font-semibold text-right">
                            {account.balance.toLocaleString("es-CO")}
                        </p>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
            );
            })}

            {currencies.length === 0 && (
            <p className="text-sm text-zinc-400">No hay cuentas activas.</p>
            )}
        </div>
        </section>
    );
}
