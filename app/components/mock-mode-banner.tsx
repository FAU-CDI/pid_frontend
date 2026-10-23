import { Link } from "@/i18n/navigation";
import {
  MOCK_MOUNT_PATH,
  MOCK_NAMESPACE_ID,
  MOCK_PID_DELETED_WITHOUT_URL,
  MOCK_PID_DELETED_WITH_URL,
  MOCK_PID_HUGE_METADATA,
  MOCK_PID_MISSING,
  MOCK_PID_WITHOUT_URL,
  MOCK_PID_WITH_URL,
} from "@/lib/backend/mock-data";

const mount = `/${MOCK_MOUNT_PATH}`;
const namespace = `/resolve/${MOCK_NAMESPACE_ID}`;

const mountFixtures = [
  { href: mount, label: "Mount", id: MOCK_MOUNT_PATH },
  {
    href: `${mount}/${MOCK_PID_WITH_URL}`,
    label: "Active with URL",
    id: MOCK_PID_WITH_URL,
  },
  {
    href: `${mount}/${MOCK_PID_WITHOUT_URL}`,
    label: "Active without URL",
    id: MOCK_PID_WITHOUT_URL,
  },
  {
    href: `${mount}/${MOCK_PID_HUGE_METADATA}`,
    label: "Huge metadata",
    id: MOCK_PID_HUGE_METADATA,
  },
  {
    href: `${mount}/${MOCK_PID_DELETED_WITH_URL}`,
    label: "Deleted with URL",
    id: MOCK_PID_DELETED_WITH_URL,
  },
  {
    href: `${mount}/${MOCK_PID_DELETED_WITHOUT_URL}`,
    label: "Deleted without URL",
    id: MOCK_PID_DELETED_WITHOUT_URL,
  },
  {
    href: `${mount}/${MOCK_PID_MISSING}`,
    label: "Missing",
    id: MOCK_PID_MISSING,
  },
] as const;

const namespaceFixtures = [
  { href: namespace, label: "Namespace", id: MOCK_NAMESPACE_ID },
  {
    href: `${namespace}/${MOCK_PID_WITH_URL}`,
    label: "Active with URL",
    id: MOCK_PID_WITH_URL,
  },
] as const;

function FixtureLink({
  href,
  label,
  id,
}: {
  href: string;
  label: string;
  id: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-baseline gap-2 text-red-50 no-underline hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
    >
      <span>{label}</span>
      <span className="font-mono text-xs text-red-200/80">{id}</span>
    </Link>
  );
}

export default function MockModeBanner() {
  return (
    <details
      lang="en"
      className="group relative bg-red-900 text-red-50 open:shadow-lg"
    >
      <summary className="mock-banner-summary">
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block text-red-300 transition-transform group-open:rotate-90"
          >
            ▸
          </span>
          Mock backend
        </span>
      </summary>
      <div className="absolute bottom-full left-0 right-0 z-10 max-h-72 overflow-auto border-t border-red-700 bg-red-900 px-8 py-4">
        <p className="mb-3 text-xs font-medium tracking-wide text-red-200 uppercase">
          Fixtures
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs text-red-300">Mount paths</p>
            <ul className="flex flex-col gap-1.5 text-sm">
              {mountFixtures.map((fixture) => (
                <li key={fixture.href}>
                  <FixtureLink {...fixture} />
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs text-red-300">Namespace paths</p>
            <ul className="flex flex-col gap-1.5 text-sm">
              {namespaceFixtures.map((fixture) => (
                <li key={fixture.href}>
                  <FixtureLink {...fixture} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </details>
  );
}
