import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { TopAccountsTable } from "@/components/dashboard/top-accounts-table";
import { ActiveAccountsByCurrency } from "@/components/dashboard/active-accounts-by-currency";
import { PrimaryRates } from "@/components/dashboard/primary-rates";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <main className="min-w-0 flex-1 space-y-6 px-4 pb-4 pt-20 sm:px-6 sm:pb-6 md:pt-6">
        <Header />

        <StatsCards />
        <PrimaryRates />
        <ActiveAccountsByCurrency />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          <div>
            <AlertsPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
