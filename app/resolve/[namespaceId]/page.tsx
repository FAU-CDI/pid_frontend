import PidForm from "../../components/pid-form";

export default async function ResolvePage({
  params,
}: {
  params: Promise<{
    namespaceId: string;
  }>;
}) {
  const { namespaceId } = await params;

  return (
    <PidForm
      mode="namespace"
      namespaceId={namespaceId}
    />
  );
}