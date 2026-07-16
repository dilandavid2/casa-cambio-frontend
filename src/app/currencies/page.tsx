"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { api } from "@/services/api";

interface Currency {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  allowsOperationalCost: boolean;
  defaultOperationalPercent: number;
}

export default function CurrenciesPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [operationalPercent, setOperationalPercent] = useState("0");
  const [allowsOperationalCost, setAllowsOperationalCost] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadCurrencies = useCallback(async () => {
    const response = await api.get("/currencies");
    setCurrencies(response.data);
  }, []);

  useEffect(() => {
    loadCurrencies().catch(() => setError("No se pudieron cargar las monedas"));
  }, [loadCurrencies]);

  async function createCurrency(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/currencies", {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        isActive: true,
        allowsOperationalCost,
        defaultOperationalPercent: Number(operationalPercent),
      });
      setCode("");
      setName("");
      setOperationalPercent("0");
      await loadCurrencies();
    } catch (requestError: any) {
      const message = requestError.response?.data?.message;
      setError(
        Array.isArray(message)
          ? message.join(", ")
          : message || "No se pudo crear la moneda; verifica que el código no exista",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteCurrency(currency: Currency) {
    const pin = window.prompt(
      `Ingresa tu PIN de seguridad para borrar ${currency.code}`,
    );
    if (!pin) return;
    try {
      await api.delete(`/currencies/${currency.id}`, { data: { pin } });
      await loadCurrencies();
    } catch (requestError: any) {
      const message = requestError.response?.data?.message;
      setError(Array.isArray(message) ? message.join(", ") : message || "No se pudo borrar la moneda");
    }
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 pb-4 pt-20 sm:px-6 sm:pb-6 md:pt-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold sm:text-4xl">Monedas</h1>
          <p className="mt-2 text-zinc-400">
            Añade las monedas utilizadas por cuentas y operaciones. La tasa se indica al crear cada operación.
          </p>
        </div>

        <form onSubmit={createCurrency} className="mb-8 grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6 md:grid-cols-2">
          <input required minLength={3} maxLength={3} value={code} onChange={(event) => setCode(event.target.value)} placeholder="Código ISO: EUR, CLP…" className="rounded-lg border border-zinc-700 bg-black px-4 py-3 uppercase" />
          <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre: Euro, Peso chileno…" className="rounded-lg border border-zinc-700 bg-black px-4 py-3" />
          <input type="number" min="0" step="0.01" value={operationalPercent} onChange={(event) => setOperationalPercent(event.target.value)} placeholder="Porcentaje operacional" className="rounded-lg border border-zinc-700 bg-black px-4 py-3" />
          <label className="flex items-center gap-3 rounded-lg border border-zinc-700 px-4 py-3">
            <input type="checkbox" checked={allowsOperationalCost} onChange={(event) => setAllowsOperationalCost(event.target.checked)} />
            Aplicar costo operacional
          </label>
          {error && <p className="text-sm text-red-400 md:col-span-2">{error}</p>}
          <button disabled={saving} className="rounded-lg bg-white px-4 py-3 font-semibold text-black disabled:opacity-60 md:col-span-2">
            {saving ? "Guardando…" : "Añadir moneda"}
          </button>
        </form>

        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="min-w-[720px] w-full">
            <thead className="bg-zinc-900 text-left text-zinc-400">
              <tr><th className="p-4">Código</th><th className="p-4">Nombre</th><th className="p-4">Costo operacional</th><th className="p-4">Estado</th><th className="p-4">Acciones</th></tr>
            </thead>
            <tbody>
              {currencies.map((currency) => (
                <tr key={currency.id} className="border-t border-zinc-800">
                  <td className="p-4 font-semibold">{currency.code}</td>
                  <td className="p-4">{currency.name}</td>
                  <td className="p-4">{currency.allowsOperationalCost ? `${currency.defaultOperationalPercent}%` : "No aplica"}</td>
                  <td className="p-4">{currency.isActive ? "Activa" : "Inactiva"}</td>
                  <td className="p-4"><button onClick={() => deleteCurrency(currency)} className="rounded-lg bg-red-600/20 px-3 py-2 text-sm text-red-400 hover:bg-red-600/30">Borrar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
