"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

interface PrimaryRate {
  code: string;
  name: string;
  rateToCOP: number | null;
  rateDate: string | null;
  source: string;
  external: boolean;
}

export function PrimaryRates() {
  const [rates, setRates] = useState<PrimaryRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/primary-rates")
      .then((response) => setRates(response.data ?? []))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <div className="mb-4">
        <h3 className="text-xl font-semibold">Tasas principales a COP</h3>
        <p className="mt-1 text-sm text-zinc-400">
          Referencia externa actual. No modifica la tasa de tus operaciones.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(loading
          ? ["CLP", "EUR", "VES", "USD"].map((code) => ({
              code,
              name: code,
              rateToCOP: null,
              rateDate: null,
              source: "Cargando",
              external: false,
            }))
          : rates
        ).map((rate) => (
          <article
            key={rate.code}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-zinc-400">1 {rate.code}</p>
                <p className="mt-2 text-2xl font-bold">
                  {rate.rateToCOP === null
                    ? "Sin tasa"
                    : `${rate.rateToCOP.toLocaleString("es-CO", {
                        maximumFractionDigits: 8,
                      })} COP`}
                </p>
              </div>
              <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-semibold">
                {rate.code}
              </span>
            </div>
            <p className="mt-4 text-xs text-zinc-500">
              {rate.rateDate
                ? new Date(rate.rateDate).toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "Todavía no registrada"}
            </p>
            <p className="mt-1 text-xs text-zinc-500">{rate.source}</p>
          </article>
        ))}
      </div>
      <p className="mt-3 text-xs text-zinc-500">
        Tasas indicativas.{" "}
        <a
          href="https://www.exchangerate-api.com"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-zinc-300"
        >
          Rates by Exchange Rate API
        </a>
      </p>
    </section>
  );
}
