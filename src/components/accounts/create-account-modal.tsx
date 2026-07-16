"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { api } from "@/services/api";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

interface Currency {
  id: number;
  code: string;
  name: string;
}

export function CreateAccountModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [type, setType] = useState("BANK_TRANSFER");
  const [currencyId, setCurrencyId] = useState("");
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  useEffect(() => {
    api.get("/currencies").then((response) => setCurrencies(response.data));
  }, []);

  async function handleCreate() {
    if (!name.trim() || !country.trim() || !currencyId) return;
    try {
      await api.post("/accounts", {
        name: name.trim(),
        country: country.trim(),
        currencyId: Number(currencyId),
        type,
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
          <h2 className="text-xl font-semibold">Nueva cuenta</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <input placeholder="Nombre" value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3" />
          <input placeholder="País" value={country} onChange={(event) => setCountry(event.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3" />
          <select value={type} onChange={(event) => setType(event.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3">
            <option value="BANK_TRANSFER">Cuenta bancaria / transferencia</option>
            <option value="CASH">Caja de efectivo</option>
            <option value="DIGITAL_WALLET">Billetera digital</option>
          </select>
          <select value={currencyId} onChange={(event) => setCurrencyId(event.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3">
            <option value="">Selecciona una moneda</option>
            {currencies.map((currency) => (
              <option key={currency.id} value={currency.id}>{currency.code} - {currency.name}</option>
            ))}
          </select>
          <button onClick={handleCreate} className="w-full rounded-lg bg-white py-3 font-medium text-black hover:bg-zinc-200">Crear cuenta</button>
        </div>
      </div>
    </div>
  );
}
