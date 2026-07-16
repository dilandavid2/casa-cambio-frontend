import { Sidebar } from "@/components/dashboard/sidebar";
import { OperationDetail } from "@/components/operations/operation-detail";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function OperationDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      <main className="min-w-0 flex-1 px-4 pb-4 pt-20 sm:px-6 sm:pb-6 md:pt-6">
        <OperationDetail operationId={id} />
      </main>
    </div>
  );
}
