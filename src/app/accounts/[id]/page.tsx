import { Sidebar } from "@/components/dashboard/sidebar";
import { AccountLedger } from "@/components/accounts/account-ledger";

export default function AccountDetailPage() {
  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      <main className="flex-1 p-6">
        <AccountLedger />
      </main>
    </div>
  );
}