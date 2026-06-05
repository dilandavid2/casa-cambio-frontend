"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

interface DashboardData {
  totalEquivalentCOP: number;
}

export function StatsCards() {
  const [balance, setBalance] = useState(0);
  const [pendingVerifications, setPendingVerifications] = useState(0);
  const [operationsCount, setOperationsCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const response = await api.get("/dashboard/global-balance");

      setBalance(response.data.totalEquivalentCOP || 0);
      const verificationsResponse = await api.get("/transfer-verifications/pending");
      setPendingVerifications(verificationsResponse.data.length || 0);

      const operationsResponse = await api.get("/operations");

      setOperationsCount(
        operationsResponse.data.length || 0
      );
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <p className="text-sm text-zinc-400">Balance global</p>

        <h3 className="text-2xl font-bold mt-2">
          ${balance.toLocaleString("es-CO")} COP
        </h3>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <p className="text-sm text-zinc-400">Ganancia total</p>

        <h3 className="text-2xl font-bold mt-2">$0 COP</h3>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <p className="text-sm text-zinc-400">Verificaciones pendientes</p>

        <h3 className="text-2xl font-bold mt-2 text-red-400">
          {pendingVerifications}
        </h3>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <p className="text-sm text-zinc-400">Operaciones</p>

        <h3 className="text-2xl font-bold mt-2 text-blue-400">
          {operationsCount}
        </h3>
      </div>
    </div>
  );
}