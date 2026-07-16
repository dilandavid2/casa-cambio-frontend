"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { CreateAccountModal } from "./create-account-modal";
import Link from "next/link";
import { TransferAccountModal } from "./transfer-account-modal";
import { InitialBalanceModal } from "./initial-balance-modal";

interface Account {
  id: number;
  name: string;
  country: string;
  type: string;
  currency: {
    code: string;
    name: string;
  };
  balance: number;
  isActive: boolean;
}

export function AccountsTable() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [showInitialBalanceModal, setShowInitialBalanceModal] =
    useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    try {
      const response = await api.get("/accounts");
      setAccounts(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteAccount(account: Account) {
    const pin = window.prompt(
      `Ingresa tu PIN de seguridad para borrar ${account.name}`,
    );
    if (!pin) return;
    try {
      await api.delete(`/accounts/${account.id}`, { data: { pin } });
      await loadAccounts();
    } catch (error: any) {
      const message = error.response?.data?.message;
      alert(Array.isArray(message) ? message.join(", ") : message || "No se pudo borrar la cuenta");
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold">
          Lista de cuentas
        </h2>

        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-white px-4 py-2 text-black font-medium hover:bg-zinc-200"
        >
          Nueva cuenta
        </button>
        
        <button
          onClick={() => setShowTransferModal(true)}
          className="rounded-lg bg-purple-600 px-4 py-2 text-white font-medium hover:bg-purple-700"
        >
          Transferir entre cuentas
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="text-left py-3">ID</th>
              <th className="text-left py-3">Nombre</th>
              <th className="text-left py-3">País</th>
              <th className="text-left py-3">Moneda</th>
              <th className="text-left py-3">Tipo</th>
              <th className="text-left py-3">Balance</th>
              <th className="text-left py-3">Estado</th>
              <th className="text-left py-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {accounts.map((account) => (
              <tr
                key={account.id}
                className="border-b border-zinc-800"
              >
                <td className="py-4">{account.id}</td>

                <td className="py-4 font-medium">
                  <Link
                    href={`/accounts/${account.id}`}
                    className="font-medium text-white hover:text-green-400"
                  >
                    {account.name}
                  </Link>
                </td>

                <td className="py-4">{account.country}</td>

                <td className="py-4">{account.currency?.code}</td>

                <td className="py-4">
                  {account.type === "CASH"
                    ? "Efectivo"
                    : account.type === "BANK_TRANSFER"
                      ? "Transferencia"
                      : account.type === "DIGITAL_WALLET"
                        ? "Billetera digital"
                        : account.type}
                </td>

                <td className="py-4">
                  {Number(account.balance).toLocaleString()}
                </td>

                <td className="py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      account.isActive
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {account.isActive ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="py-4">
                  {Number(account.balance) === 0 && (
                    <button
                      onClick={() => {
                        setSelectedAccount(account);
                        setShowInitialBalanceModal(true);
                      }}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                    >
                      Saldo inicial
                    </button>
                  )}
                  <button onClick={() => deleteAccount(account)} className="ml-2 rounded-lg bg-red-600/20 px-3 py-2 text-sm text-red-400 hover:bg-red-600/30">Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <CreateAccountModal
          onClose={() => setShowModal(false)}
          onCreated={loadAccounts}
        />
      )}
      {showTransferModal && (
        <TransferAccountModal
          accounts={accounts}
          onClose={() => setShowTransferModal(false)}
          onCompleted={loadAccounts}
        />
      )}

      {showInitialBalanceModal && selectedAccount && (
        <InitialBalanceModal
          account={selectedAccount}
          onClose={() => {
            setShowInitialBalanceModal(false);
            setSelectedAccount(null);
          }}
          onCompleted={() => {
            loadAccounts();
          }}
        />
      )}
    
    </div>
  );
}
