"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

interface OperationSummary {
  totalPagado?: number;
  saldoPendiente?: number;
  paymentStatus?: "PAID" | "PARTIAL" | "PENDING";

  operation: {
    id: number;
    code: string;
    description?: string;
    paymentMode?: "IMMEDIATE" | "PENDING";
    operationDate: string;
    createdAt?: string;
    amountSource: number;
    amountTargetEstimated: number;
    amountTargetFinal?: number;
    marketRate: number;
    effectiveRate: number;
    operationalPercent: number;
    sourceCurrencyCode?: string;
    targetCurrencyCode?: string;
    currencySource?: string;
    currencyTarget?: string;
    
    client?: string;

    status?: string | { name?: string };
    sourceCurrency?: string | { code?: string; name?: string };
    targetCurrency?: string | { code?: string; name?: string };
  };

  payments: any[];
  splits: any[];
  ledgerEntries: any[];
  movements: any[];
}

interface Props {
  operationId: string;
}

export function OperationDetail({ operationId }: Props) {
  const [data, setData] = useState<OperationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentCurrencyId, setPaymentCurrencyId] = useState("");
  const [paymentAccountId, setPaymentAccountId] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [rateToCOP, setRateToCOP] = useState("");
  const [rateSource, setRateSource] = useState("SYSTEM");
  const [requiresVerification, setRequiresVerification] =
  useState(false);

    async function loadOperation() {
      try {
        const response = await api.get(
          `/operations/${operationId}/summary`
        );

        console.log("DETALLE OPERACIÓN:", response.data);

        setData(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    async function loadAccounts() {
      try {
        const response = await api.get("/accounts");
        setAccounts(response.data);
      } catch (error) {
        console.error(error);
      }
    }

    async function handleRegisterPayment() {
      try {
        if (!paymentCurrencyId || !paymentAccountId || !paymentAmount || !paymentDate) {
          alert("Completa los campos requeridos");
          return;
        }

        await api.post(`/operations/${operationId}/payments`, {
          accountId: Number(paymentAccountId),
          currencyId: Number(paymentCurrencyId),
          amount: Number(paymentAmount),
          paymentDate,
          rateToCOP: parsedRate || undefined,
          rateSource,
          notes: paymentNotes,
          requiresVerification,
        });

        setShowPaymentModal(false);

        setPaymentCurrencyId("");
        setPaymentAccountId("");
        setPaymentAmount("");
        setPaymentDate("");
        setRateToCOP("");
        setPaymentNotes("");

        await loadOperation();
      } catch (error) {
        console.error(error);
        alert("No se pudo registrar el abono");
      }
    }

  useEffect(() => {
    loadOperation();
    loadAccounts();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-zinc-400">
        Cargando operación...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-red-400">
        No se pudo cargar la operación.
      </div>
    );
  }

  const operation = data.operation;

  const sourceCurrency =
  operation.currencySource ??
  operation.sourceCurrencyCode ??
  (typeof operation.sourceCurrency === "string"
    ? operation.sourceCurrency
    : operation.sourceCurrency?.code) ??
  "-";

  const targetCurrency =
    operation.currencyTarget ??
    operation.targetCurrencyCode ??
    (typeof operation.targetCurrency === "string"
      ? operation.targetCurrency
      : operation.targetCurrency?.code) ??
    "-";

  function formatDate(value?: string) {
    if (!value) return "Sin fecha";

    const date = new Date(value);

    if (isNaN(date.getTime())) return "Sin fecha";

    return date.toLocaleString("es-CO");
  }
  
  function getNowLocalDateTime() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);

    return local.toISOString().slice(0, 16);
  }

  function normalizeDateInput(value: string) {
    if (!value) return "";

    const [datePart, timePart = "00:00"] = value.split("T");
    const [year = "", month = "", day = ""] = datePart.split("-");

    const fixedYear = year.slice(0, 4);
    const fixedValue = `${fixedYear}-${month}-${day}T${timePart.slice(0, 5)}`;

    const today = getNowLocalDateTime();

    if (fixedValue.length === 16 && fixedValue > today) {
      return today;
    }

    return fixedValue;
  }

  function formatMoney(value?: number) {
    if (value === undefined || value === null) return "-";

    return Number(value).toLocaleString("es-CO");
  }
  const parsedAmount = Number(paymentAmount || 0);
  const parsedRate = Number(rateToCOP || 0);

  const estimatedCOP =
    parsedRate > 0
      ? Math.round(parsedAmount * parsedRate)
      : 0;

  const estimatedInSource =
  parsedRate > 0 && operation.marketRate > 0
    ? parsedAmount * parsedRate / operation.marketRate
    : 0;
  
    const remainingAfterPayment =
  estimatedInSource > 0
    ? Math.max(Number(data?.saldoPendiente ?? 0) - estimatedInSource, 0)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">
          {operation.description || operation.code}
        </h1>

        <p className="mt-2 text-zinc-400">
          Detalle completo de operación
        </p>
        <div className="mt-4 flex gap-3">
          {operation.paymentMode === "PENDING" &&
          (data.saldoPendiente ?? 0) > 0 &&
          operation.status !== "Completada" && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              Registrar abono
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Cliente</p>

          <h2 className="mt-2 text-2xl font-bold">
            {operation.client ?? "N/A"}
          </h2>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Estado</p>

          <h2 className="mt-2 text-2xl font-bold">
            {typeof operation.status === "string"
            ? operation.status
            : operation.status?.name ?? "Sin estado"}
          </h2>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-zinc-400 text-sm mb-2">
            Estado de pago
          </p>

          <h2
            className={`text-3xl font-bold ${
              data.paymentStatus === "PAID"
                ? "text-green-400"
                : data.paymentStatus === "PARTIAL"
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
            {data.paymentStatus === "PAID"
              ? operation.status !== "Completada"
                ? "Pagado · por completar"
                : "Pagado"
              : data.paymentStatus === "PARTIAL"
              ? "Parcial"
              : "Pendiente"}
          </h2>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">
                {operation.paymentMode === "PENDING" ? "Total abonado" : "Monto pagado"}
              </span>

              <span className="font-semibold">
                {data.totalPagado?.toLocaleString("es-CO")}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-400">
                Saldo pendiente
              </span>

              <span className="font-semibold text-red-400">
                {data.saldoPendiente?.toLocaleString("es-CO")} {sourceCurrency}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Fecha</p>

          <h2 className="mt-2 text-2xl font-bold">
            {operation.operationDate
                ? new Date(operation.operationDate).toLocaleString("es-CO")
                : operation.createdAt
                ? new Date(operation.createdAt).toLocaleString("es-CO")
                : "Sin fecha"}
          </h2>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-5 text-2xl font-semibold">
          Información financiera
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-zinc-400">Moneda origen</p>
            <p className="text-xl font-semibold">
              {sourceCurrency}
            </p>
          </div>

          <div>
            <p className="text-zinc-400">Moneda destino</p>
            <p className="text-xl font-semibold">
              {targetCurrency}
            </p>
          </div>

          <div>
            <p className="text-zinc-400">Monto origen</p>
            <p className="text-xl font-semibold">
              {operation.amountSource.toLocaleString("es-CO")}
            </p>
          </div>

          <div>
            <p className="text-zinc-400">Monto estimado</p>
            <p className="text-xl font-semibold text-green-400">
              {operation.amountTargetEstimated.toLocaleString("es-CO")}
            </p>
          </div>

          <div>
            <p className="text-zinc-400">Tasa mercado</p>
            <p className="text-xl font-semibold">
              {operation.marketRate}
            </p>
          </div>

        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-5 text-2xl font-semibold">
          Movimientos ledger
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] table-fixed text-sm">
            <thead className="border-b border-zinc-800 text-zinc-400">
              <tr>
                <th className="w-[220px] py-3 text-left">Fecha</th>
                <th className="w-[100px] py-3 text-left">Tipo</th>
                <th className="w-[140px] py-3 text-left">Monto</th>
                <th className="w-[220px] py-3 text-left">Cuenta</th>
                <th className="py-3 text-left">Descripción</th>
              </tr>
            </thead>

            <tbody>
              {((data.ledgerEntries?.length ? data.ledgerEntries : data.movements) ?? []).map((entry: any) => (
                <tr
                  key={entry.id}
                  className="border-b border-zinc-800"
                >
                  <td className="py-4">
                    {formatDate(entry.date ?? entry.createdAt ?? operation.operationDate)}
                  </td>

                  <td className="py-4">
                    <span
                      className={`font-semibold ${
                        entry.type === "ENTRY"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {entry.type}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <div>{entry.amount?.toLocaleString("es-CO")}</div>

                    <div className="text-xs text-zinc-500">
                      {entry.currency?.code ?? sourceCurrency}
                    </div>

                    {entry.currency?.code !== sourceCurrency &&
                    entry.equivalentInSource && (
                      <div className="text-xs text-zinc-400">
                        ≈ {formatMoney(entry.equivalentInSource)} {sourceCurrency}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-4 text-left">
                    {entry.account?.name ?? "-"}
                  </td>

                  <td className="py-4 text-zinc-300">
                    {entry.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-6 text-2xl font-bold">Pagos registrados</h2>

        {data.payments && data.payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-zinc-400">
                  <th className="py-3">Fecha</th>
                  <th>Cuenta</th>
                  <th>Moneda</th>
                  <th>Monto</th>
                  <th>Tasa COP</th>
                  <th>Equiv. COP</th>
                  <th>Nota</th>
                </tr>
              </thead>

              <tbody>
                {data.payments.map((payment: any) => (
                  <tr key={payment.id} className="border-b border-zinc-800">
                    <td className="py-3">
                      {payment.paymentDate
                        ? new Date(payment.paymentDate).toLocaleString("es-CO")
                        : "-"}
                    </td>

                    <td>{payment.account?.name ?? "-"}</td>

                    <td>{payment.currency?.code ?? "-"}</td>

                    <td>{formatMoney(payment.amount)}</td>

                    <td>{payment.rateToCOP ?? "-"}</td>

                    <td className="font-bold text-green-400">
                      <div>{formatMoney(payment.valueCOP)}</div>
                      <div className="text-sm font-normal text-zinc-400">
                        ≈ {formatMoney(payment.equivalentInSource)} {sourceCurrency}
                      </div>
                    </td>

                    <td>{payment.notes ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-zinc-400">Esta operación no tiene pagos registrados.</p>
        )}
      </div>
      {showPaymentModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Registrar abono</h2>

            <button
              onClick={() => setShowPaymentModal(false)}
              className="text-2xl text-zinc-400 hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="space-y-4">
            <select
            value={paymentCurrencyId}
            onChange={(e) => {
              setPaymentCurrencyId(e.target.value);
              setPaymentAccountId("");

              const currencyCode = accounts.find(
                (a) => a.currency?.id === Number(e.target.value)
              )?.currency?.code;

              if (currencyCode === "COP") {
                setRateToCOP("1");
                setRateSource("SYSTEM");
              } else {
                setRateToCOP("");
                setRateSource("MANUAL");
              }
            }}
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white"
          >
            <option value="">Moneda del abono</option>
            {[...new Map(
              accounts
                .filter((account) => account.currency)
                .map((account) => [account.currency.id, account.currency])
            ).values()].map((currency: any) => (
              <option key={currency.id} value={currency.id}>
                {currency.code} - {currency.name}
              </option>
            ))}
          </select>

          <select
            value={paymentAccountId}
            onChange={(e) => setPaymentAccountId(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white"
          >
            <option value="">Cuenta donde entra el abono</option>
            {accounts
              .filter((account) => account.currency?.id === Number(paymentCurrencyId))
              .map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} - {account.country} - Saldo:{" "}
                  {account.balance?.toLocaleString("es-CO")}
                </option>
              ))}
          </select>

          <input
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="Monto del abono"
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white"
          />

          <input
            type="datetime-local"
            value={paymentDate}
            max={getNowLocalDateTime()}
            onInput={(e) => {
              const input = e.currentTarget;
              input.value = normalizeDateInput(input.value);
            }}
            onChange={(e) =>
              setPaymentDate(normalizeDateInput(e.target.value))
            }
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white"
          />

          <input
            type="number"
            value={rateToCOP}
            onChange={(e) => {
              setRateToCOP(e.target.value);
              setRateSource("MANUAL");
            }}
            placeholder="Tasa a COP"
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white"
          />

          <button
            type="button"
            onClick={() => {
              const pending = Number(data.saldoPendiente ?? 0);
              const rate = Number(rateToCOP || 0);

              if (!paymentCurrencyId) {
                alert("Selecciona la moneda del abono");
                return;
              }

              if (rate <= 0) {
                alert("Coloca la tasa a COP");
                return;
              }

              const selectedCurrency = accounts.find(
                (a) => a.currency?.id === Number(paymentCurrencyId)
              )?.currency?.code;

              if (selectedCurrency === sourceCurrency) {
                setPaymentAmount(String(pending));
              } else {
                alert("Para pagar restante en otra moneda, coloca el monto manualmente según la tasa.");
              }
            }}
            className="w-full rounded-xl border border-green-600 px-5 py-3 font-semibold text-green-400 hover:bg-green-600 hover:text-white"
          >
            Pagar restante
          </button>

          {estimatedCOP > 0 && (
            <div className="space-y-3 rounded-xl border border-zinc-800 bg-black p-4">
              <div>
                <p className="text-sm text-zinc-400">Equivalente estimado COP</p>
                <p className="mt-1 text-xl font-bold text-green-400">
                  {estimatedCOP.toLocaleString("es-CO")} COP
                </p>
              </div>

              <div>
                <p className="text-sm text-zinc-400">Equivalente en deuda</p>
                <p className="mt-1 text-xl font-bold text-yellow-400">
                  {formatMoney(estimatedInSource)} {sourceCurrency}
                </p>
              </div>

              <div>
                <p className="text-sm text-zinc-400">
                  Saldo restante después del abono
                </p>
                <p className="mt-1 text-xl font-bold text-red-400">
                  {formatMoney(remainingAfterPayment)} {sourceCurrency}
                </p>
              </div>
            </div>
          )}

          <textarea
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            placeholder="Nota del abono"
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white"
          />

          <button
            onClick={handleRegisterPayment}
            className="w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            Guardar abono
          </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
