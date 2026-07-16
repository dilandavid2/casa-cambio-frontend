import { Sidebar } from "@/components/dashboard/sidebar";
import { AccountsTable } from "@/components/accounts/accounts-table";

export default function AccountsPage() {
  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      <main className="min-w-0 flex-1 px-4 pb-4 pt-20 sm:px-6 sm:pb-6 md:pt-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold sm:text-4xl">Cuentas</h1>
          <p className="text-zinc-400 mt-2">
            Gestión de cuentas financieras
          </p>
        </div>

        <AccountsTable />
      </main>
    </div>
  );
}
