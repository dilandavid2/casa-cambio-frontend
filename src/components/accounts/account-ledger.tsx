"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/services/api";

interface LedgerItem {
  date: string;
  type: "ENTRY" | "EXIT";
  amount: number;
  balanceAfter: number;
  description: string;
  operationId?: number;
}

interface LedgerResponse {
  accountId: number;
  ledger: LedgerItem[];
}

function formatMoney(value: number) {
  return Number(value || 0).toLocaleString("es-CO");
}

export function AccountLedger() {
  const params = useParams();
  const accountId = params.id;

  const [data, setData] = useState<LedgerResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLedger();
  }, [accountId]);

  async function loadLedger() {
    try {
      setLoading(true);
      const response = await api.get(`/accounts/${accountId}/ledger`);
      setData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const currentBalance =
    data?.ledger?.length && data.ledger.length > 0
      ? data.ledger[data.ledger.length - 1].balanceAfter
      : 0;

  const totalEntries =
    data?.ledger
      ?.filter((item) => item.type === "ENTRY")
      .reduce((sum, item) => sum + item.amount, 0) ?? 0;

  const totalExits =
    data?.ledger
      ?.filter((item) => item.type === "EXIT")
      .reduce((sum, item) => sum + item.amount, 0) ?? 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Detalle de cuenta</h1>
        <p className="mt-2 text-zinc-400">
          Ledger y movimientos financieros de la cuenta #{accountId}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-zinc-400">Saldo actual</p>
          <h2 className="mt-2 text-2xl font-bold">
            {formatMoney(currentBalance)}
          </h2>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-zinc-400">Total entradas</p>
          <h2 className="mt-2 text-2xl font-bold text-green-400">
            {formatMoney(totalEntries)}
          </h2>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-zinc-400">Total salidas</p>
          <h2 className="mt-2 text-2xl font-bold text-red-400">
            {formatMoney(totalExits)}
          </h2>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-6 text-xl font-bold">Movimientos</h2>

        {loading ? (
          <p className="text-zinc-400">Cargando movimientos...</p>
        ) : !data?.ledger?.length ? (
          <p className="text-zinc-400">Esta cuenta no tiene movimientos.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="py-3">Fecha</th>
                <th className="py-3">Tipo</th>
                <th className="py-3 text-right">Monto</th>
                <th className="py-3 pr-10 text-right">
                  Saldo
                </th>
                <th className="py-3">Descripción</th>
              </tr>
            </thead>

            <tbody>
              {data.ledger.map((item, index) => (
                <tr key={index} className="border-b border-zinc-800">
                  <td className="py-4">
                    {new Date(item.date).toLocaleString("es-CO")}
                  </td>

                  <td className="py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        item.type === "ENTRY"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {item.type === "ENTRY" ? "Entrada" : "Salida"}
                    </span>
                  </td>

                  <td className="py-4 text-right font-bold">
                    {formatMoney(item.amount)}
                  </td>

                  <td className="py-4 pr-10 text-right font-bold whitespace-nowrap">
                    {formatMoney(item.balanceAfter)}
                  </td>

                  <td className="py-4 text-zinc-300">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
