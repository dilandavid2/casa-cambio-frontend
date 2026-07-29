"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { api } from "@/services/api";

interface Currency {
  id: number;
  code: string;
  name: string;
}

interface Account {
  id: number;
  name: string;
  country: string;
  balance: number;
  currency: {
    id: number;
    code: string;
    name: string;
  };
}

interface SplitItem {
  targetCurrencyId: string;
  accountId: string;
  amount: string;
  rateToCOP: string;
  notes: string;
}

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateOperationModal({ onClose, onCreated }: Props) {
  const [description, setDescription] = useState("");
  const [amountSource, setAmountSource] = useState("");
  const [sourceCurrencyId, setSourceCurrencyId] = useState("");
  const [sourceAccountId, setSourceAccountId] = useState("");
  const [targetCurrencyId, setTargetCurrencyId] = useState("");
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [operationDate, setOperationDate] = useState("");
  const [clientName, setClientName] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [useSplits, setUseSplits] = useState(false);
  const [directRate, setDirectRate] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [calculationMode, setCalculationMode] = useState<"RATE" | "AMOUNT">("AMOUNT");
  const [paymentMode, setPaymentMode] = useState<"IMMEDIATE" | "PENDING">("IMMEDIATE");
  const [splits, setSplits] = useState<SplitItem[]>([
  {
      targetCurrencyId: "",
      accountId: "",
      amount: "",
      rateToCOP: "",
      notes: "",
    },
  ]);
  const [targetAccountId, setTargetAccountId] = useState("");
  const [clientSuggestions, setClientSuggestions] = useState<string[]>([]);
  const [descriptionSuggestions, setDescriptionSuggestions] = useState<string[]>([]);

    const sourceCurrencyCode =
  currencies.find((currency) => currency.id === Number(sourceCurrencyId))
    ?.code || "";
    const targetCurrencyCode =
  currencies.find((currency) => currency.id === Number(targetCurrencyId))
    ?.code || "";
    const isSameCurrency =
      Boolean(sourceCurrencyId) && sourceCurrencyId === targetCurrencyId;
    const resolvedTargetAmount =
      calculationMode === "RATE" && Number(directRate) > 0
        ? Number(amountSource || 0) / Number(directRate)
        : Number(targetAmount || 0);

    

    async function loadInitialData() {
      try {
        const [currenciesResponse, accountsResponse] =
          await Promise.all([
            api.get("/currencies"),
            api.get("/accounts"),
          ]);

        setCurrencies(currenciesResponse.data);
        setAccounts(accountsResponse.data);
      } catch (error) {
        console.error(error);
      }
    }

    useEffect(() => {
      loadInitialData();
    }, []);

    useEffect(() => {
      const timer = window.setTimeout(async () => {
        try {
          const response = await api.get("/operations/suggestions", {
            params: { q: clientName },
          });
          setClientSuggestions(response.data.clients ?? []);
        } catch (error) {
          console.error(error);
        }
      }, 250);

      return () => window.clearTimeout(timer);
    }, [clientName]);

    useEffect(() => {
      const timer = window.setTimeout(async () => {
        try {
          const response = await api.get("/operations/suggestions", {
            params: { q: description },
          });
          setDescriptionSuggestions(response.data.descriptions ?? []);
        } catch (error) {
          console.error(error);
        }
      }, 250);

      return () => window.clearTimeout(timer);
    }, [description]);

    function updateSplit(index: number, field: keyof SplitItem, value: string) {
      const updated = splits.map((split, itemIndex) => {
        if (itemIndex !== index) return split;

        return {
          ...split,
          [field]: value,
          ...(field === "targetCurrencyId" ? { accountId: "" } : {}),
        };
      });

      setSplits(updated);
    }

    function addSplit() {
      setSplits([
        ...splits,
        {
          targetCurrencyId: "",
          accountId: "",
          amount: "",
          rateToCOP: "",
          notes: "",
        }
      ]);
    }

    function removeSplit(index: number) {
      setSplits(splits.filter((_, itemIndex) => itemIndex !== index));
    }

  async function handleCreate() {
    try {
      if (!operationDate) {
        alert("Debes seleccionar una fecha");
        return;
      }
      if (!clientName.trim() || !description.trim()) {
        alert("Debes indicar el nombre del cliente y una descripción");
        return;
      }
      const fechaOperacion = new Date(`${operationDate}T12:00:00`);
      const hoy = new Date();
      const fechaMinima = new Date("2024-01-01");

      if (fechaOperacion < fechaMinima) {
        alert("La fecha de operación es demasiado antigua");
        return;
      }

      if (fechaOperacion > hoy) {
        alert("La fecha no puede ser futura");
        return;
      }
      if (useSplits && remainingAmount !== 0) {
        alert("La suma de los splits debe coincidir con el monto origen");
        return;
      }
      if (paymentMode === "IMMEDIATE" && !sourceAccountId) {
        alert("Debes seleccionar la cuenta donde entra el dinero");
        return;
      }
      if (paymentMode === "IMMEDIATE" && !useSplits && !targetAccountId) {
        alert("Debes seleccionar la cuenta de donde sale el dinero");
        return;
      }
      if (
        paymentMode === "IMMEDIATE" &&
        !useSplits &&
        false
      ) {
        alert("Debes indicar una tasa destino válida");
        return;
      }
      if (
        paymentMode === "IMMEDIATE" &&
        !useSplits &&
        resolvedTargetAmount <= 0
      ) {
        alert(
          calculationMode === "RATE"
            ? "Debes indicar una tasa válida"
            : "Debes indicar cuánto recibirá el cliente",
        );
        return;
      }
      const amount = Number(amountSource);
      const calculatedSourceRate =
        sourceCurrencyCode === "COP"
          ? 1
          : targetCurrencyCode === "COP" && resolvedTargetAmount > 0
            ? resolvedTargetAmount / amount
            : undefined;

      const valueCOP =
        paymentMode === "IMMEDIATE"
          ? calculatedSourceRate
            ? amount * calculatedSourceRate
            : undefined
          : amount;

      const calculatedTargetRate =
        targetCurrencyCode === "COP"
          ? 1
          : valueCOP
            ? valueCOP / resolvedTargetAmount
            : undefined;
      const amountTargetEstimated =
        paymentMode === "IMMEDIATE"
          ? useSplits
            ? 0
            : targetCurrencyCode === "COP"
              ? valueCOP
              : resolvedTargetAmount
          : amount;
      await api.post("/operations", {
        description: description.trim(),
        clientName,
        sourceCurrencyId:
          paymentMode === "IMMEDIATE"
            ? Number(sourceCurrencyId)
            : Number(targetCurrencyId),
        sourceAccountId:
          paymentMode === "IMMEDIATE" && sourceAccountId
            ? Number(sourceAccountId)
            : undefined,
        targetCurrencyId: useSplits
        ? Number(splits[0]?.targetCurrencyId)
        : Number(targetCurrencyId),
        targetAccountId: targetAccountId ? Number(targetAccountId) : undefined,
        amountSource:
          paymentMode === "IMMEDIATE"
            ? Number(amountSource)
            : Number(amountSource),
        amountTargetEstimated,
        paymentMode,
        copToTargetRate: calculatedTargetRate
          ? calculatedTargetRate
          : undefined,
        manualRateToCOP: calculatedSourceRate,
        operationDate: operationDate
          ? new Date(`${operationDate}T12:00:00`).toISOString()
          : new Date().toISOString(),
        splits: useSplits
        ? splits.map((split) => {
            const currency = currencies.find(
              (item) => item.id === Number(split.targetCurrencyId)
            );

            const rate =
              currency?.code === "COP"
                ? 1
                : Number(split.rateToCOP || 0);

            return {
              targetCurrencyId: Number(split.targetCurrencyId),
              accountId: Number(split.accountId),
              amount: Number(split.amount),
              manualRateToCOP: rate,
              valueCOP: Number(split.amount) * rate,
              notes: split.notes,
            };
          })
        : undefined,
      });

      onCreated();
      onClose();
    } catch (error: any) {
        console.log("ERROR COMPLETO:", error);
        console.log("RESPUESTA BACKEND:", error.response?.data);
        alert(JSON.stringify(error.response?.data, null, 2));
    }
  }


  const totalSplits = splits.reduce((sum, split) => {
    const currency = currencies.find(
      (item) => item.id === Number(split.targetCurrencyId)
    );

    const amount = Number(split.amount || 0);

    const rate =
      currency?.code === "COP"
        ? 1
        : Number(split.rateToCOP || 0);

    return sum + amount * rate;
  }, 0);

  const originRate =
    sourceCurrencyCode === "COP"
      ? 1
      : targetCurrencyCode === "COP" && resolvedTargetAmount > 0
        ? resolvedTargetAmount / Number(amountSource || 1)
        : 0;

  const totalOriginCOP =
    Number(amountSource || 0) * originRate;

  const remainingAmount = totalOriginCOP - totalSplits;
  const crossRate =
    Number(amountSource) > 0 && resolvedTargetAmount > 0
      ? resolvedTargetAmount / Number(amountSource)
      : 0;
  const inverseCrossRate = crossRate > 0 ? 1 / crossRate : 0;
  const formatRate = (value: number) =>
    value.toLocaleString("es-CO", { maximumFractionDigits: 8 });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Nueva operación</h2>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>
    
        <div className="space-y-4">
          <input
            list="client-name-suggestions"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Nombre del cliente"
            className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none"
          />
          <datalist id="client-name-suggestions">
            {clientSuggestions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          <input
            placeholder="Descripción. Ej: Cambio para viaje"
            list="operation-description-suggestions"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
          />
          <datalist id="operation-description-suggestions">
            {descriptionSuggestions.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>

          <input
            type="date"
            min="2024-01-01"
            max={new Date().toISOString().slice(0, 10)}
            value={operationDate}
            onChange={(e) => setOperationDate(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-4 text-white outline-none"
          />

          <select
            value={paymentMode}
            onChange={(e) => {
              const mode = e.target.value as "IMMEDIATE" | "PENDING";
              setPaymentMode(mode);

              if (mode === "PENDING") {
                setSourceCurrencyId("");
                setSourceAccountId("");
                setDirectRate("");
                setUseSplits(false);
              }
            }}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
          >
            <option value="IMMEDIATE">Pago inmediato</option>
            <option value="PENDING">Pago pendiente / por abonos</option>
          </select>

          <input
            placeholder={
              paymentMode === "IMMEDIATE"
                ? "Monto que entrega el cliente"
                : "Monto que recibirá el cliente"
            }
            value={amountSource}
            onChange={(e) => setAmountSource(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
          />

          {paymentMode === "IMMEDIATE" && (
            <>
              <select
                value={sourceCurrencyId}
                onChange={(e) => setSourceCurrencyId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
              >
                <option value="">Moneda origen</option>
                {currencies.map((currency) => (
                  <option key={currency.id} value={currency.id}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>

              <select
                value={sourceAccountId}
                onChange={(e) => setSourceAccountId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
              >
                <option value="">Cuenta donde entra el dinero</option>
                {accounts
                  .filter((account) => account.currency?.id === Number(sourceCurrencyId))
                  .map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} - {account.country} - Saldo:{" "}
                      {account.balance.toLocaleString("es-CO")}
                    </option>
                  ))}
              </select>

            </>
          )}

            {!useSplits ? (
              <select
                value={targetCurrencyId}
                onChange={(e) => setTargetCurrencyId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
              >
                <option value="">Moneda destino</option>
                {currencies.map((currency) => (
                  <option key={currency.id} value={currency.id}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            ) : null}

            {paymentMode === "IMMEDIATE" && !useSplits && targetCurrencyId && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 rounded-lg border border-zinc-700 p-1">
                    <button type="button" onClick={() => { setCalculationMode("RATE"); setTargetAmount(""); }} className={`rounded-md px-3 py-2 ${calculationMode === "RATE" ? "bg-white text-black" : "text-zinc-400"}`}>Colocar tasa</button>
                    <button type="button" onClick={() => { setCalculationMode("AMOUNT"); setDirectRate(""); }} className={`rounded-md px-3 py-2 ${calculationMode === "AMOUNT" ? "bg-white text-black" : "text-zinc-400"}`}>Colocar monto</button>
                </div>
                {calculationMode === "RATE" ? (
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">
                      1 {targetCurrencyCode || "moneda destino"} equivale a cuántos {sourceCurrencyCode || "moneda origen"}
                    </label>
                    <input type="number" min="0" step="any" value={directRate} onChange={(e) => setDirectRate(e.target.value)} placeholder={`Ej: 1 ${targetCurrencyCode || "destino"} = ? ${sourceCurrencyCode || "origen"}`} className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3" />
                  </div>
                ) : (
                  <input type="number" step="0.01" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder={`Monto que recibirá el cliente en ${targetCurrencyCode || "moneda destino"}`} className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3" />
                )}
                {resolvedTargetAmount > 0 && (
                  <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-zinc-300">
                    {isSameCurrency && calculationMode === "AMOUNT" ? (
                      <>
                        <p>Entra: <strong>{Number(amountSource).toLocaleString("es-CO")} {sourceCurrencyCode}</strong></p>
                        <p>Se entrega: <strong>{resolvedTargetAmount.toLocaleString("es-CO")} {targetCurrencyCode}</strong></p>
                        <p>Diferencia: <strong>{(Number(amountSource) - resolvedTargetAmount).toLocaleString("es-CO")} {sourceCurrencyCode}</strong></p>
                      </>
                    ) : (
                      <>
                        <p>1 {sourceCurrencyCode} = <strong>{formatRate(crossRate)} {targetCurrencyCode}</strong></p>
                        <p>1 {targetCurrencyCode} = <strong>{formatRate(inverseCrossRate)} {sourceCurrencyCode}</strong></p>
                      </>
                    )}
                    {calculationMode === "RATE" && (
                      <p className="mt-2 text-green-400">
                        Cliente recibe: <strong>{resolvedTargetAmount.toLocaleString("es-CO", { maximumFractionDigits: 8 })} {targetCurrencyCode}</strong>
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {!useSplits && targetCurrencyId && (
              <select
                value={targetAccountId}
                onChange={(e) => setTargetAccountId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
              >
                <option value="">Cuenta de donde sale el dinero</option>
                {accounts
                  .filter(
                    (account) =>
                      account.currency?.id === Number(targetCurrencyId) &&
                      account.id !== Number(sourceAccountId),
                  )
                  .map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} - {account.country} - Saldo:{" "}
                      {account.balance.toLocaleString("es-CO")}
                    </option>
                  ))}
              </select>
            )}
          {paymentMode === "IMMEDIATE" && (
            <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-4">
            <label className="flex items-center gap-2 font-semibold">
              <input
                type="checkbox"
                checked={useSplits}
                onChange={(e) => setUseSplits(e.target.checked)}
              />
              Usar operación split
            </label>

            {useSplits && (
              <div className="mt-4 space-y-4">
                {splits.map((split, index) => {
                  const availableAccounts = accounts.filter(
                    (account) =>
                      account.currency?.id === Number(split.targetCurrencyId)
                  );
                  
                  const splitCurrency = currencies.find(
                    (currency) => currency.id === Number(split.targetCurrencyId)
                  );

                  const splitCurrencyCode = splitCurrency?.code || "";

                  return (
                    <div
                      key={index}
                      className="space-y-3 rounded-lg border border-zinc-800 bg-black p-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">Split #{index + 1}</p>

                        {splits.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSplit(index)}
                            className="text-sm text-red-400"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>

                      <select
                        value={split.targetCurrencyId}
                        onChange={(e) =>
                          updateSplit(index, "targetCurrencyId", e.target.value)
                        }
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
                      >
                        <option value="">Moneda del split</option>
                        {currencies.map((currency) => (
                          <option key={currency.id} value={currency.id}>
                            {currency.code} - {currency.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={split.accountId}
                        onChange={(e) =>
                          updateSplit(index, "accountId", e.target.value)
                        }
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
                      >
                        <option value="">Cuenta de donde sale este monto</option>
                        {availableAccounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name} - {account.country} - Saldo:{" "}
                            {account.balance.toLocaleString("es-CO")}
                          </option>
                        ))}
                      </select>

                      <input
                        value={split.amount}
                        onChange={(e) =>
                          updateSplit(index, "amount", e.target.value)
                        }
                        placeholder="Monto del split"
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
                      />
                      {splitCurrencyCode !== "COP" && (
                        <input
                          value={split.rateToCOP}
                          onChange={(e) => updateSplit(index, "rateToCOP", e.target.value)}
                          placeholder="Tasa del split a COP"
                          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
                        />
                      )}

                      <input
                        value={split.notes}
                        onChange={(e) =>
                          updateSplit(index, "notes", e.target.value)
                        }
                        placeholder="Nota del split"
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
                      />
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={addSplit}
                  className="w-full rounded-lg border border-green-700 px-4 py-3 font-semibold text-green-400"
                >
                  + Agregar split
                </button>

                <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Total distribuido:</span>
                    <span>{totalSplits.toLocaleString("es-CO")}</span>
                  </div>

                  <div className="flex justify-between font-bold">
                    <span className="text-zinc-400">Restante:</span>
                    <span className={remainingAmount === 0 ? "text-green-400" : "text-red-400"}>
                      {remainingAmount.toLocaleString("es-CO")}
                    </span>
                  </div>
                </div>
              </div>

            )}
          </div>
          )}

          {paymentMode === "IMMEDIATE" && !useSplits && amountSource && targetCurrencyId && resolvedTargetAmount > 0 && (
            <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4 text-sm space-y-2">
              {(sourceCurrencyCode === "COP" || targetCurrencyCode === "COP") && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">Valor equivalente COP:</span>
                  <span>
                    {totalOriginCOP.toLocaleString("es-CO")} COP
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-zinc-400">
                  {isSameCurrency ? "Diferencia:" : "Tasa utilizada:"}
                </span>
                <span>
                  {isSameCurrency
                    ? `${(Number(amountSource) - resolvedTargetAmount).toLocaleString("es-CO")} ${sourceCurrencyCode}`
                    : `1 ${sourceCurrencyCode} = ${formatRate(crossRate)} ${targetCurrencyCode}`}
                </span>
              </div>

              <div className="flex justify-between font-bold text-green-400">
                <span>Cliente recibe estimado:</span>
                <span>
                  {(
                    targetCurrencyCode === "COP"
                      ? totalOriginCOP
                      : resolvedTargetAmount
                  ).toLocaleString("es-CO")}{" "}
                  {currencies.find((c) => c.id === Number(targetCurrencyId))?.code}
                </span>
              </div>
            </div>
          )}

          {paymentMode === "PENDING" && amountSource && targetCurrencyId && (
            <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-400">Cliente recibirá:</span>
                <span className="font-bold text-green-400">
                  {Number(amountSource).toLocaleString("es-CO")}{" "}
                  {currencies.find((c) => c.id === Number(targetCurrencyId))?.code}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-400">Saldo pendiente inicial:</span>
                <span className="font-bold text-red-400">
                  {Number(amountSource).toLocaleString("es-CO")}{" "}
                  {currencies.find((c) => c.id === Number(targetCurrencyId))?.code}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleCreate}
            className="sticky bottom-0 mt-4 w-full rounded-lg bg-white px-4 py-3 font-semibold text-black"
          >
            Crear operación
          </button>
        </div>
      </div>
    </div>
  );
}
