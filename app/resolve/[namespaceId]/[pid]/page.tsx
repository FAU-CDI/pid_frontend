import PidForm from "@/app/components/pid-form";

export default async function NamespacePidPage({
  params,
}: {
  params: Promise<{
    namespaceId: string;
    pid: string;
  }>;
}) {
  const { namespaceId, pid } = await params;

  return (
    <PidForm
      mode="namespace"
      namespaceId={namespaceId}
      initialPid={pid}
    />
  );
}