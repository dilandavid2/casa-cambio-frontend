"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

interface Props {
  operationId: number;
  targetCurrencyId: number;
  hasSplits?: boolean;
  amountTargetEstimated: number;
  onClose: () => void;
  onCompleted: () => void;
}

interface Account {
  id: number;
  name: string;
  platform?: string;
  balance: number;
  currency?: {
    id: number;
    code: string;
  };
}

export function CompleteOperationModal({
  operationId,
  targetCurrencyId,
  hasSplits = false,
  amountTargetEstimated,
  onClose,
  onCompleted,
}: Props) {
  
  const [amountTargetFinal, setAmountTargetFinal] = useState("");
  const [accountId, setAccountId] = useState("");

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    try {
      const response = await api.get(
        `/accounts?currencyId=${targetCurrencyId}`
      );

      setAccounts(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleComplete() {
    try {
      setLoading(true);

      await api.patch(`/operations/${operationId}/complete`, {
        confirmedByUserId: 1,
      });

      onCompleted();
      onClose();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "No se pudo completar la operación"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold">
            Completar operación
          </h2>

          <button
            onClick={onClose}
            className="text-3xl text-zinc-400 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-zinc-300">
            Al confirmar, se completará la operación usando los datos ya registrados.
          </div>
          <button
            onClick={handleComplete}
            disabled={loading}
            className="w-full rounded-xl bg-green-500 py-4 text-lg font-semibold text-white hover:bg-green-600 disabled:opacity-50"
          >
            {loading
              ? "Completando..."
              : "Completar operación"}
          </button>
        </div>
      </div>
    </div>
  );
}