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

      <main className="flex-1 p-6">
        <OperationDetail operationId={id} />
      </main>
    </div>
  );
}