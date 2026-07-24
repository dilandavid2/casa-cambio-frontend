"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/sidebar";

interface TransferVerification {
  id: number;
  status: string;
  reason: string;
  notes?: string;
  createdAt: string;
  operation: {
    id: number;
    code: string;
    description?: string;
    amountSource: number;
    valueCOP: number;
    pendingAmount: number;
    client?: {
      name: string;
    };
    sourceCurrency?: {
      code: string;
    };
    targetCurrency?: {
      code: string;
    };
  };
}

export default function AlertsPage() {
  const [verifications, setVerifications] = useState<TransferVerification[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadVerifications() {
    try {
      setLoading(true);
      const response = await api.get("/transfer-verifications/pending");
      setVerifications(response.data);
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar las verificaciones pendientes");
    } finally {
      setLoading(false);
    }
  }

  async function confirmVerification(id: number) {
    try {
      const confirmed = confirm("¿Confirmas que el dinero ingresó correctamente?");
      if (!confirmed) return;

      await api.patch(`/transfer-verifications/${id}/confirm`, {
        notes: "Dinero confirmado desde el panel de alertas",
      });

      await loadVerifications();
    } catch (error: any) {
      console.error(error);
      alert(
        error?.response?.data?.message ||
          "No se pudo confirmar la transferencia"
      );
    }
  }

  useEffect(() => {
    loadVerifications();
  }, []);

  return (
    <div className="flex min-h-screen bg-black text-white">
    <Sidebar />
    <main className="min-w-0 flex-1 px-4 pb-4 pt-20 sm:px-8 sm:pb-8 md:pt-8">
      <h1 className="text-3xl font-bold sm:text-5xl">Verificaciones de transferencias</h1>
      <p className="mt-2 text-zinc-400">
        Pagos bancarios pendientes por confirmar.
      </p>
      
      <div className="mt-8 mb-6">
        <Link
          href="/dashboard"
          className="rounded-lg bg-zinc-800 px-4 py-2 text-white hover:bg-zinc-700"
        >
          ← Volver al Dashboard
        </Link>
      </div>

      <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Transferencias por verificar
            </h2>
            <p className="text-zinc-400">
              Pagos VES que todavía no han sido confirmados.
            </p>
          </div>

          <button
            onClick={loadVerifications}
            className="rounded-xl bg-zinc-800 px-4 py-2 font-semibold hover:bg-zinc-700"
          >
            Actualizar
          </button>
        </div>

        {loading ? (
          <p className="text-zinc-400">Cargando verificaciones...</p>
        ) : verifications.length === 0 ? (
          <p className="rounded-xl border border-zinc-800 bg-black p-5 text-zinc-400">
            No hay transferencias pendientes por verificar.
          </p>
        ) : (
          <div className="space-y-4">
            {verifications.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-red-900/50 bg-black p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm text-red-400">
                      Verificación pendiente
                    </p>

                    <h3 className="mt-1 text-2xl font-bold">
                      {item.operation?.client?.name || "Cliente sin nombre"}
                    </h3>

                    <p className="mt-2 text-zinc-400">
                      Operación:{" "}
                      <span className="font-semibold text-white">
                        {item.operation?.description || item.operation?.code}
                      </span>
                    </p>

                    <p className="text-zinc-400">
                      Motivo: {item.reason}
                    </p>

                    {item.notes && (
                      <p className="text-zinc-400">
                        Nota: {item.notes}
                      </p>
                    )}

                    <p className="mt-2 text-sm text-zinc-500">
                      Registrada:{" "}
                      {new Date(item.createdAt).toLocaleString("es-CO")}
                    </p>
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="text-zinc-400">Pendiente operación</p>
                    <p className="text-2xl font-bold text-red-400">
                      {item.operation?.pendingAmount?.toLocaleString("es-CO")} COP
                    </p>

                    <button
                      onClick={() => confirmVerification(item.id)}
                      className="mt-4 rounded-xl bg-green-500 px-5 py-3 font-bold text-white hover:bg-green-600"
                    >
                      Confirmar dinero recibido
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
    </div>
  );
}
