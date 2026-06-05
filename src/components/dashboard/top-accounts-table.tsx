"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

interface TopAccount {
  accountId: number;
  country: string;
  currency: string;
  balance: number;
  rateToCOP: number;
  equivalentCOP: number;
}

export function TopAccountsTable() {
  const [accounts, setAccounts] = useState<TopAccount[]>([]);

  useEffect(() => {
    loadTopAccounts();
  }, []);

  async function loadTopAccounts() {
    try {
      const response = await api.get("/dashboard/top-accounts");
      setAccounts(response.data.topAccounts || []);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <h3 className="text-lg font-semibold mb-4">Top cuentas</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-zinc-400">
            <tr className="border-b border-zinc-800">
              <th className="text-left py-3">ID</th>
              <th className="text-left py-3">País</th>
              <th className="text-left py-3">Moneda</th>
              <th className="text-right py-3">Balance</th>
              <th className="text-right py-3">Equiv. COP</th>
            </tr>
          </thead>

          <tbody>
            {accounts.map((account) => (
              <tr
                key={account.accountId}
                className="border-b border-zinc-800 last:border-0"
              >
                <td className="py-3">{account.accountId}</td>
                <td className="py-3">{account.country}</td>
                <td className="py-3">{account.currency}</td>
                <td className="py-3 text-right">
                  {account.balance.toLocaleString("es-CO")}
                </td>
                <td className="py-3 text-right font-semibold">
                  ${account.equivalentCOP.toLocaleString("es-CO")}
                </td>
              </tr>
            ))}

            {accounts.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-zinc-400">
                  No hay cuentas cargadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}