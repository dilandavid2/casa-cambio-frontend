import { Sidebar } from "@/components/dashboard/sidebar";
import { AccountsTable } from "@/components/accounts/accounts-table";

export default function AccountsPage() {
  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-4xl font-bold">Cuentas</h1>
          <p className="text-zinc-400 mt-2">
            Gestión de cuentas financieras
          </p>
        </div>

        <AccountsTable />
      </main>
    </div>
  );
}