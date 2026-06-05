"use client";

import { useState } from "react";
import { api } from "@/services/api";

type Account = {
  id: number;
  name: string;
  country: string;
  balance: number;
  currency: {
    code: string;
  };
};

type Props = {
  account: Account;
  onClose: () => void;
  onCompleted: () => void;
};

export function InitialBalanceModal({ account, onClose, onCompleted }: Props) {
  const [amount, setAmount] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleSubmit() {
    setError("");
    setSuccess("");

    if (!amount || Number(amount) <= 0) {
      setError("Ingresa un saldo inicial válido");
      return;
    }

    setShowConfirm(true);
  }

  async function confirmInitialBalance() {
    try {
      setLoading(true);

      await api.post(`/accounts/${account.id}/initial-balance`, {
        amount: Number(amount),
      });

      setSuccess("Saldo inicial registrado correctamente");

      setTimeout(() => {
        onCompleted();
        onClose();
      }, 1000);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Error al registrar el saldo inicial"
      );
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-white shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Saldo inicial</h2>

          <button
            onClick={onClose}
            className="text-3xl text-zinc-400 hover:text-white"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-400">
            {success}
          </div>
        )}

        <div className="mb-5 rounded-xl border border-zinc-700 bg-black px-4 py-4">
          <p className="text-sm text-zinc-400">Cuenta</p>
          <p className="text-lg font-bold">
            {account.name} - {account.currency.code}
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Saldo actual: {account.balance}
          </p>
        </div>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Monto del saldo inicial"
          className="mb-5 w-full rounded-xl border border-zinc-700 bg-black px-4 py-4"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 px-4 py-4 font-bold hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Registrando..." : "Registrar saldo inicial"}
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 p-6 text-white">
            <h3 className="mb-4 text-2xl font-bold">Confirmar saldo inicial</h3>

            <div className="mb-6 space-y-2 text-zinc-300">
              <p>
                <strong>Cuenta:</strong> {account.name}
              </p>

              <p>
                <strong>Moneda:</strong> {account.currency.code}
              </p>

              <p>
                <strong>Monto:</strong> {Number(amount).toLocaleString()}
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
                onClick={confirmInitialBalance}
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 font-bold hover:bg-blue-700 disabled:opacity-60"
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