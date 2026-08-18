import { headers } from "next/headers";
import PidForm from "../components/pid-form";

export default async function MountPage({
  params,
}: {
  params: Promise<{
    mount: string;
  }>;
}) {
  const { mount } = await params;

  const headersList = await headers();

  const protocol =
    headersList.get("x-forwarded-proto") || "http";

  const host = headersList.get("host");

  if (!host) {
    throw new Error("Unable to determine host");
  }

  const baseUri =
    `${protocol}://${host}/${mount}/`;

  return (
    <PidForm
      mode="mount"
      baseUri={baseUri}
    />
  );
}