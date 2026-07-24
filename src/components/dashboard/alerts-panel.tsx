"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { api } from "@/services/api";

interface AlertItem {
  accountId?: number;
  operationId?: number;
  name?: string;
  code?: string;
  country?: string;
  currency?: string;
  balance?: number;
  realProfitCOP?: number;
  alert: string;
}

interface AlertsResponse {
  summary: {
    totalAlerts: number;
  };
  alerts: {
    negativeAccounts: AlertItem[];
    highBalanceAccounts: AlertItem[];
    lossOperations: AlertItem[];
  };
}
interface PendingVerification {
  id: number;
  createdAt?: string;
  operation?: {
    id?: number;
    client?: {
      name?: string;
    };
    code?: string;
    description?: string;
  };
}

export function AlertsPanel() {
  const [data, setData] = useState<AlertsResponse | null>(null);
  const [pendingVerifications, setPendingVerifications] = useState<PendingVerification[]>([]);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const [financialRes, pendingRes] = await Promise.all([
          api.get("/dashboard/financial-alerts"),
          api.get("/transfer-verifications/pending"),
        ]);

        setData(financialRes.data);
        setPendingVerifications(pendingRes.data || []);
      } catch (error) {
        console.error("No se pudieron cargar las alertas", error);
      }
    }

    void loadAlerts();
  }, []);

  const verificationAlerts: AlertItem[] = [];

  if (pendingVerifications.length > 0) {
    verificationAlerts.push({
      alert: `Transferencias VES pendientes por verificar (${pendingVerifications.length})`,
      name: "Revisión general",
    });
  }

  const pendingByClient = pendingVerifications.reduce<Record<string, number>>(
    (acc, item) => {
      const clientName = item.operation?.client?.name || "Cliente sin nombre";
      acc[clientName] = (acc[clientName] || 0) + 1;
      return acc;
    },
    {}
  );

  Object.entries(pendingByClient).forEach(([clientName, count]) => {
    if (count >= 3) {
      verificationAlerts.push({
        alert: `Cliente con varias transferencias pendientes (${count})`,
        name: clientName,
      });
    }
  });

  const allAlerts = data
    ? [
        ...verificationAlerts,
        ...data.alerts.negativeAccounts,
        ...data.alerts.highBalanceAccounts,
        ...data.alerts.lossOperations,
      ]
    : verificationAlerts;

  function getAlertColor(alert: string) {
    if (alert.toLowerCase().includes("saldo negativo")) {
      return "text-red-400";
    }
    if (alert.toLowerCase().includes("pérdida")) {
      return "text-red-500";
    }

    if (alert.toLowerCase().includes("saldo muy alto")) {
      return "text-yellow-400";
    }

    if (alert.toLowerCase().includes("sin ganancia")) {
      return "text-orange-400";
    }

    if (alert.toLowerCase().includes("pendientes por verificar")) {
      return "text-blue-400";
    }

    if (alert.toLowerCase().includes("varias transferencias")) {
      return "text-purple-400";
    }

    return "text-yellow-400";
  }  

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Alertas financieras</h3>
        <span className="rounded-full bg-red-500/10 px-3 py-1 text-sm text-red-400">
          {allAlerts.length}
        </span>
      </div>

      <div className="space-y-3">
        {allAlerts.slice(0, 6).map((item, index) => (
          <div
            key={index}
            onClick={() => {
              if (
                item.alert.includes("pendientes por verificar")
              ) {
                window.location.href="/alerts";
              }

              if (item.code) {
                window.location.href=`/operations/${item.operationId}`;
              }
            }}
            className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 cursor-pointer hover:border-zinc-700 hover:bg-zinc-900 transition"
          >
            <div className="flex gap-3">
              <AlertTriangle
                className={`mt-0.5 ${getAlertColor(item.alert)}`}
                size={18}
              />
              <div>
                <p className={`font-medium text-sm ${getAlertColor(item.alert)}`}>
                  {item.alert}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  {item.name || item.code || "Registro"}{" "}
                  {item.currency ? `· ${item.currency}` : ""}
                </p>
              </div>
            </div>
          </div>
        ))}

        {allAlerts.length === 0 && (
          <p className="text-sm text-zinc-400">No hay alertas cargadas.</p>
        )}
      </div>
    </div>
  );
}
