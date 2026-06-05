"use client";

import { useState } from "react";
import { api } from "@/services/api";

type Account = {
  id: number;
  name: string;
  country: string;
  currency: {
    code: string;
  };
  balance: number;
};

type Props = {
  accounts: Account[];
  onClose: () => void;
  onCompleted: () => void;
};

export function TransferAccountModal({ accounts, onClose, onCompleted }: Props) {
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [operationDate, setOperationDate] = useState("");
  const [description, setDescription] = useState("Transferencia entre cuentas");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

    async function handleSubmit() {
        setError("");
        setSuccess("");
        if (!fromAccountId || !toAccountId) {
            alert("Selecciona cuenta origen y destino");
            return;
        }

        if (fromAccountId === toAccountId) {
            alert("La cuenta origen y destino no pueden ser iguales");
            return;
        }

        if (!amount || Number(amount) <= 0) {
            alert("Ingresa un monto valido");
            return;
        }

        if (!operationDate) {
            alert("Selecciona la fecha de la transferencia");
            return;
        }

        setShowConfirm(true);
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

    async function confirmTransfer() {
        try {
            setLoading(true);

            await api.post("/accounts/transfer", {
            fromAccountId: Number(fromAccountId),
            toAccountId: Number(toAccountId),
            amount: Number(amount),
            operationDate,
            description,
            });

            setSuccess("Transferencia registrada correctamente");

            setTimeout(() => {
                onCompleted();
                onClose();
            }, 1000);
        } catch (error: any) {
            setError(
                error?.response?.data?.message ||
                "Error al transferir entre cuentas"
            );
        } finally {
            setLoading(false);
            setShowConfirm(false);
        }
    }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-white shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Transferir entre cuentas</h2>
          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
                {error}
            </div>
            )}

            {success && (
            <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-400">
                {success}
            </div>
            )}

          <button onClick={onClose} className="text-3xl text-zinc-400 hover:text-white">
            ×
          </button>
        </div>

        <div className="space-y-5">
          <select
            value={fromAccountId}
            onChange={(e) => setFromAccountId(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-4"
          >
            <option value="">Cuenta origen</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} - {account.currency.code} - Saldo: {account.balance}
              </option>
            ))}
          </select>

          <select
            value={toAccountId}
            onChange={(e) => setToAccountId(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-4"
          >
            <option value="">Cuenta destino</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} - {account.currency.code} - Saldo: {account.balance}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Monto a transferir"
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-4"
          />

          <input
            type="datetime-local"
            value={operationDate}
            max={getNowLocalDateTime()}
            onInput={(e) => {
              const input = e.currentTarget;
              input.value = normalizeDateInput(input.value);
            }}
            onChange={(e) =>
              setOperationDate(normalizeDateInput(e.target.value))
            }
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-4"
          />
          
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción"
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-4"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-xl bg-purple-600 px-4 py-4 font-bold hover:bg-purple-700 disabled:opacity-60"
          >
            {loading ? "Registrando..." : "Registrar transferencia"}
          </button>
        </div>
      </div>
    {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80">
            <div className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 p-6 text-white">
            <h3 className="mb-4 text-2xl font-bold">Confirmar transferencia</h3>

            <div className="mb-6 space-y-2 text-zinc-300">
            <p>
                <strong>Origen:</strong> {fromAccountId}
            </p>

            <p>
                <strong>Destino:</strong> {toAccountId}
            </p>

            <p>
                <strong>Monto:</strong> {Number(amount).toLocaleString()}
            </p>

            <p>
                <strong>Fecha:</strong> {operationDate}
            </p>
            </div>

            <div className="flex gap-4">
                <button
                onClick={() => setShowConfirm(false)}
                className="w-full rounded-xl border border-zinc-700 px-4 py-3 font-bold hover:bg-zinc-800"
                >
                Cancelar
                </button>

                <button
                onClick={confirmTransfer}
                disabled={loading}
                className="w-full rounded-xl bg-purple-600 px-4 py-3 font-bold hover:bg-purple-700 disabled:opacity-60"
                >
                {loading ? "Registrando..." : "Confirmar"}
                </button>
            </div>
            </div>
        </div>
        )}
    </div>
  );
}