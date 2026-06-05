import { Sidebar } from "@/components/dashboard/sidebar";
import { OperationsTable } from "@/components/operations/operations-table";

export default function OperationsPage() {
  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-4xl font-bold">Operaciones</h1>
          <p className="text-zinc-400 mt-2">
            Registro y control de operaciones de cambio
          </p>
        </div>

        <OperationsTable />
      </main>
    </div>
  );
}