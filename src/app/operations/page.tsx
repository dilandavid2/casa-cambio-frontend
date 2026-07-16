import { Sidebar } from "@/components/dashboard/sidebar";
import { OperationsTable } from "@/components/operations/operations-table";

export default function OperationsPage() {
  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      <main className="min-w-0 flex-1 px-4 pb-4 pt-20 sm:px-6 sm:pb-6 md:pt-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold sm:text-4xl">Operaciones</h1>
          <p className="text-zinc-400 mt-2">
            Registro y control de operaciones de cambio
          </p>
        </div>

        <OperationsTable />
      </main>
    </div>
  );
}
