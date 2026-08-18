import { headers } from "next/headers";
import PidForm from "../../components/pid-form";

export default async function MountPidPage({
  params,
}: {
  params: Promise<{
    mount: string;
    pid: string;
  }>;
}) {
  const { mount, pid } = await params;

  const headersList = await headers();

  const protocol =
    headersList.get("x-forwarded-proto") || "http";

  const host = headersList.get("host");

  if (!host) {
    throw new Error("Unable to determine host");
  }

  const baseUri =
    `${protocol}://${host}/${mount}/`;

  console.log("Mount PID page:");
  console.log("mount:", mount);
  console.log("pid:", pid);
  console.log("baseUri:", baseUri);

  return (
    <PidForm
      mode="mount"
      baseUri={baseUri}
      initialPid={pid}
    />
  );
}