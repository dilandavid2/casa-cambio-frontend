"use client";

import { useState } from "react";
import { api } from "@/services/api";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateAccountModal({
  onClose,
  onCreated,
}: Props) {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [currencyId, setCurrencyId] = useState("");

  async function handleCreate() {
    try {
      await api.post("/accounts", {
  name,
  country,
  currencyId: Number(currencyId),
  type: "bank",
  platform: "Manual",
  identifier: `${country.toUpperCase()}-${Date.now()}`,
  balance: 0,
  isActive: true,
});

      onCreated();
      onClose();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Nueva cuenta
          </h2>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <input
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
          />

          <input
            placeholder="País"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
          />

          <input
            placeholder="ID moneda (1=USD, 2=EUR...)"
            value={currencyId}
            onChange={(e) => setCurrencyId(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
          />

          <button
            onClick={handleCreate}
            className="w-full rounded-lg bg-white py-3 font-medium text-black hover:bg-zinc-200"
          >
            Crear cuenta
          </button>
        </div>
      </div>
    </div>
  );
}