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
  const [code, setCode] = useState("");
  const [amountSource, setAmountSource] = useState("");
  const [sourceCurrencyId, setSourceCurrencyId] = useState("");
  const [sourceAccountId, setSourceAccountId] = useState("");
  const [targetCurrencyId, setTargetCurrencyId] = useState("");
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [operationDate, setOperationDate] = useState("");
  const [clientName, setClientName] = useState("");
  const [manualRateToCOP, setManualRateToCOP] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [useSplits, setUseSplits] = useState(false);
  const [copToTargetRate, setCopToTargetRate] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [calculationMode, setCalculationMode] = useState<"RATE" | "AMOUNT">("RATE");
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

    const sourceCurrencyCode =
  currencies.find((currency) => currency.id === Number(sourceCurrencyId))
    ?.code || "";
    const targetCurrencyCode =
  currencies.find((currency) => currency.id === Number(targetCurrencyId))
    ?.code || "";

    

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
        targetCurrencyCode !== "COP" &&
        calculationMode === "RATE" &&
        Number(copToTargetRate) <= 0
      ) {
        alert("Debes indicar una tasa destino válida");
        return;
      }
      if (
        paymentMode === "IMMEDIATE" &&
        !useSplits &&
        calculationMode === "AMOUNT" &&
        Number(targetAmount) <= 0
      ) {
        alert("Debes indicar cuánto recibirá el cliente");
        return;
      }
      const amount = Number(amountSource);
      const calculatedSourceRate =
        sourceCurrencyCode === "COP"
          ? 1
          : calculationMode === "AMOUNT" &&
              targetCurrencyCode === "COP" &&
              Number(targetAmount) > 0
            ? Number(targetAmount) / amount
            : Number(manualRateToCOP);

      const valueCOP =
        paymentMode === "IMMEDIATE"
          ? amount * calculatedSourceRate
          : amount;

      const calculatedTargetRate =
        targetCurrencyCode === "COP"
          ? 1
          : calculationMode === "AMOUNT" && Number(targetAmount) > 0
          ? valueCOP / Number(targetAmount)
          : Number(copToTargetRate);
      const amountTargetEstimated =
        paymentMode === "IMMEDIATE"
          ? useSplits
            ? 0
            : targetCurrencyCode === "COP"
              ? valueCOP
              : calculationMode === "AMOUNT"
              ? Number(targetAmount)
              : valueCOP / calculatedTargetRate
          : amount;
      await api.post("/operations", {
        code,
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
        manualRateToCOP: calculatedSourceRate || undefined,
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
      : calculationMode === "AMOUNT" && targetCurrencyCode === "COP" && Number(targetAmount) > 0
        ? Number(targetAmount) / Number(amountSource || 1)
        : Number(manualRateToCOP || 0);

  const totalOriginCOP =
    Number(amountSource || 0) * originRate;

  const remainingAmount = totalOriginCOP - totalSplits;

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
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Nombre del cliente"
          className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none"
        />
          <input
            placeholder="Código. Ej: OP-FRONT-001"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
          />

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
                setManualRateToCOP("");
                setCopToTargetRate("");
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

              {sourceCurrencyCode !== "COP" && !(calculationMode === "AMOUNT" && targetCurrencyCode === "COP") && <div className="space-y-2">
                <label className="text-sm text-zinc-400">
                  Tasa de la moneda recibida a COP
                </label>

                <input
                  type="number"
                  value={manualRateToCOP}
                  onChange={(e) => setManualRateToCOP(e.target.value)}
                  placeholder="Ej: 0.88"
                  className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3"
                />
              </div>}
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
                    <button type="button" onClick={() => setCalculationMode("RATE")} className={`rounded-md px-3 py-2 ${calculationMode === "RATE" ? "bg-white text-black" : "text-zinc-400"}`}>Colocar tasa</button>
                    <button type="button" onClick={() => setCalculationMode("AMOUNT")} className={`rounded-md px-3 py-2 ${calculationMode === "AMOUNT" ? "bg-white text-black" : "text-zinc-400"}`}>Colocar monto</button>
                </div>
                {calculationMode === "RATE" ? (
                  targetCurrencyCode === "COP" ? (
                    <p className="text-sm text-zinc-400">Usa la tasa de la moneda recibida indicada arriba.</p>
                  ) : (
                  <input type="number" step="0.0001" value={copToTargetRate} onChange={(e) => setCopToTargetRate(e.target.value)} placeholder={`Tasa de ${targetCurrencyCode || "destino"} a COP`} className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3" />
                  )
                ) : (
                  <input type="number" step="0.01" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder={`Monto que recibirá el cliente en ${targetCurrencyCode || "moneda destino"}`} className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3" />
                )}
                {calculationMode === "AMOUNT" && Number(targetAmount) > 0 && (
                  <p className="text-sm text-zinc-400">Tasa calculada: {(targetCurrencyCode === "COP" ? Number(targetAmount) / Number(amountSource || 1) : totalOriginCOP / Number(targetAmount)).toLocaleString("es-CO")} COP</p>
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
                  .filter((account) => account.currency?.id === Number(targetCurrencyId))
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

          {paymentMode === "IMMEDIATE" && !useSplits && amountSource && targetCurrencyId && (sourceCurrencyCode === "COP" || manualRateToCOP || (calculationMode === "AMOUNT" && targetCurrencyCode === "COP" && targetAmount)) && (targetCurrencyCode === "COP" || (calculationMode === "RATE" ? copToTargetRate : targetAmount)) && (
            <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-400">Valor equivalente COP:</span>
                <span>
                  {(Number(amountSource) * Number(manualRateToCOP)).toLocaleString("es-CO")} COP
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-400">Tasa utilizada:</span>
                <span>{targetCurrencyCode === "COP" ? originRate.toLocaleString("es-CO") : calculationMode === "AMOUNT" ? (totalOriginCOP / Number(targetAmount)).toLocaleString("es-CO") : copToTargetRate}</span>
              </div>

              <div className="flex justify-between font-bold text-green-400">
                <span>Cliente recibe estimado:</span>
                <span>
                  {(
                    targetCurrencyCode === "COP"
                      ? totalOriginCOP
                      : calculationMode === "AMOUNT"
                        ? Number(targetAmount)
                        : totalOriginCOP / Number(copToTargetRate)
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
