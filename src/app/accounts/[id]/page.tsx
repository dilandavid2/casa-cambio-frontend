import { Sidebar } from "@/components/dashboard/sidebar";
import { AccountLedger } from "@/components/accounts/account-ledger";

export default function AccountDetailPage() {
  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      <main className="min-w-0 flex-1 px-4 pb-4 pt-20 sm:px-6 sm:pb-6 md:pt-6">
        <AccountLedger />
      </main>
    </div>
  );
}
