"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { CreateOperationModal } from "@/components/operations/create-operation-modal";
import Link from "next/link";
import { CompleteOperationModal } from "@/components/operations/complete-operation-modal";

interface Operation {
  id: number;
  code: string;
  description?: string;
  amountSource: number;
  amountTargetEstimated: number;
  amountTargetFinal?: number;
  marketRate: number;
  effectiveRate: number;
  statusId:number;
  paymentStatus?: string;
  amountPaid?: number;
  pendingAmount?: number;
  targetCurrencyId?: number;
  splits?: {
    id: number;
    amount: number;
    valueCOP?: number;
    accountId?: number;
    targetCurrencyId?: number;
  }[];
  status?: {
    name?: string;
  };
  type?: {
    name?: string;
  };
  client?: {
    name?: string;
  };
  sourceCurrency?: {
    code?: string;
  };
  targetCurrency?: {
    code?: string;
  };
  operationDate: string;
}

export function OperationsTable() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currencyFilter, setCurrencyFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [selectedOperation, setSelectedOperation] =
  useState<Operation | null>(null);

  useEffect(() => {
    loadOperations();
  }, []);

  async function loadOperations() {
    try {
      const response = await api.get("/operations");
      setOperations(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteOperation(operation: Operation) {
    const deleteCode = prompt(
      `Para eliminar la operación ${operation.code}, escribe el código de seguridad`
    );

    if (!deleteCode) return;

    const confirmDelete = confirm(
      `¿Seguro que deseas eliminar la operación ${operation.code}? Esta acción borrará sus movimientos y pagos.`
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/operations/${operation.id}`, {
        data: { deleteCode },
      });

      await loadOperations();
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          "No se pudo eliminar la operación"
      );
    }
  }

const filteredOperations = operations.filter((operation) => {
  const text = search.toLowerCase();

  const matchesSearch =
    operation.description?.toLowerCase().includes(text) ||
    operation.code?.toLowerCase().includes(text) ||
    operation.client?.name?.toLowerCase().includes(text) ||
    operation.sourceCurrency?.code?.toLowerCase().includes(text) ||
    operation.targetCurrency?.code?.toLowerCase().includes(text);

  const matchesStatus =
    statusFilter === "ALL" || operation.status?.name === statusFilter;

  const matchesCurrency =
    currencyFilter === "ALL" ||
    operation.sourceCurrency?.code === currencyFilter ||
    operation.targetCurrency?.code === currencyFilter;

  const matchesDate = (() => {
  if (dateFilter === "ALL") return true;

  const operationDate = new Date(operation.operationDate);
  const today = new Date();

  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const startOfOperationDay = new Date(
    operationDate.getFullYear(),
    operationDate.getMonth(),
    operationDate.getDate()
  );

  if (dateFilter === "TODAY") {
    return startOfOperationDay.getTime() === startOfToday.getTime();
  }

  if (dateFilter === "LAST_7_DAYS") {
    const sevenDaysAgo = new Date(startOfToday);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return operationDate >= sevenDaysAgo;
  }

  if (dateFilter === "THIS_MONTH") {
    return (
      operationDate.getFullYear() === today.getFullYear() &&
      operationDate.getMonth() === today.getMonth()
    );
  }

  return true;
})();

  return matchesSearch && matchesStatus && matchesCurrency && matchesDate;
});

const sortedOperations = [...filteredOperations].sort(
  (a, b) =>
    new Date(b.operationDate).getTime() -
    new Date(a.operationDate).getTime()
);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="mb-6 flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Lista de operaciones</h2>

          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-white px-5 py-3 font-medium text-black hover:bg-zinc-200"
          >
            Nueva operación
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por descripción, cliente o moneda..."
            className="rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
          >
            <option value="ALL">Todos los estados</option>
            <option value="Creada">Creada</option>
            <option value="Completada">Completada</option>
          </select>

          <select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
          >
            <option value="ALL">Todas las monedas</option>
            <option value="USD">USD</option>
            <option value="CLP">CLP</option>
            <option value="EUR">EUR</option>
            <option value="COP">COP</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
          >
            <option value="ALL">Todas las fechas</option>
            <option value="TODAY">Hoy</option>
            <option value="LAST_7_DAYS">Últimos 7 días</option>
            <option value="THIS_MONTH">Este mes</option>
          </select>
        </div>

        
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800 text-zinc-400">
            <tr>
              <th className="py-3">Fecha</th>
              <th className="py-3 text-left">Descripción</th>
              <th className="py-3 text-left">Cliente</th>
              <th className="py-3 text-left">Tipo</th>
              <th className="py-3 text-left">Estado</th>
              <th className="py-3 text-left">Origen</th>
              <th className="py-3 text-left">Destino</th>
              <th className="py-3 text-right">Monto</th>
              <th className="py-3 text-center">Pago</th>
              <th className="py-3 text-right">Pendiente</th>
              <th className="py-3 text-right">Estimado</th>
              <th className="py-3 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {sortedOperations.map((operation) => (
              <tr key={operation.id} className="border-b border-zinc-800">
                <td className="py-4 text-zinc-300">
                  {new Date(operation.operationDate).toLocaleDateString("es-CO")}
                </td>

                <td className="py-4 font-medium">
                  {operation.description || operation.code}
                </td>
                <td className="py-4">{operation.client?.name ?? "N/A"}</td>
                <td className="py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      operation.type?.name === "Compra"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-purple-500/20 text-purple-400"
                    }`}
                  >
                    {operation.type?.name}
                  </span>
                </td>
                <td className="py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      operation.status?.name === "Completada"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {operation.status?.name}
                  </span>
                </td>
                <td className="py-4">{operation.sourceCurrency?.code}</td>
                <td className="py-4">{operation.targetCurrency?.code}</td>
                <td className="py-4 text-right">
                  {operation.amountSource?.toLocaleString("es-CO")}
                </td>
                <td className="py-4 text-center">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      operation.paymentStatus === "PAID"
                        ? "bg-green-500/20 text-green-400"
                        : operation.paymentStatus === "PARTIAL"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {operation.paymentStatus === "PAID"
                      ? "Pagada"
                      : operation.paymentStatus === "PARTIAL"
                      ? "Parcial"
                      : "Pendiente"}
                  </span>
                </td>

                <td className="py-4 text-right font-bold text-red-400">
                  {operation.pendingAmount && operation.pendingAmount > 0
                    ? `${operation.pendingAmount.toLocaleString("es-CO")} ${operation.sourceCurrency?.code ?? ""}`
                    : "-"}
                </td>

                <td className="py-4 text-right font-semibold">
                  {operation.amountTargetEstimated?.toLocaleString("es-CO")}
                </td>
                <td className="py-4 text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/operations/${operation.id}`}
                    className="rounded-lg bg-zinc-700 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-600"
                  >
                    Ver
                  </Link>

                  {["Creada", "Verificada"].includes(
                    operation.status?.name ?? ""
                  ) && (
                    <button
                      onClick={() => setSelectedOperation(operation)}
                      className="rounded-lg bg-green-500 px-3 py-2 text-xs font-medium text-white hover:bg-green-600"
                    >
                      Completar
                    </button>
                  )}
                  <button
                    onClick={() => deleteOperation(operation)}
                    className="rounded-lg bg-red-500 px-3 py-2 text-xs font-medium text-white hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
              </tr>
            ))}

            {operations.length === 0 && (
              <tr>
                <td colSpan={10} className="py-6 text-center text-zinc-400">
                  No hay operaciones registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {filteredOperations.length === 0 && (
            <p className="mt-6 text-center text-zinc-400">
              No se encontraron operaciones con esos filtros.
            </p>
          )}
      </div>

      {showModal && (
        <CreateOperationModal
          onClose={() => setShowModal(false)}
          onCreated={loadOperations}
        />
      )}
      {selectedOperation && (
        <CompleteOperationModal
          operationId={selectedOperation.id}
          targetCurrencyId={selectedOperation.targetCurrencyId || 0}
          amountTargetEstimated={selectedOperation.amountTargetEstimated}
          hasSplits={(selectedOperation.splits?.length ?? 0) > 0}
          onClose={() => setSelectedOperation(null)}
          onCompleted={loadOperations}
        />
      )}
    </div>
  );
}
