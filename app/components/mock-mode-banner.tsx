import {
  MOCK_MOUNT_BASE_URI,
  MOCK_MOUNT_PATH,
  MOCK_NAMESPACE_ID,
  MOCK_PID_DELETED_WITHOUT_URL,
  MOCK_PID_DELETED_WITH_URL,
  MOCK_PID_MISSING,
  MOCK_PID_WITHOUT_URL,
  MOCK_PID_WITH_URL,
  MOCK_RESOLVER_URL,
} from "@/lib/backend/mock-data";

export default function MockModeBanner() {
  return (
    <div className="group relative bg-red-900 text-red-50">
      <div className="px-8 py-2 text-sm font-medium">
        Mock mode — hover for test IDs
      </div>
      <div
        className="invisible absolute bottom-full left-0 right-0 z-10 max-h-64 overflow-auto border-t border-red-700 bg-red-900 px-8 py-3 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100"
      >
        <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap">
          <code>{`resolver:   ${MOCK_RESOLVER_URL}
namespace:  ${MOCK_NAMESPACE_ID}
mount:      ${MOCK_MOUNT_BASE_URI}

PIDs:
  with URL:        ${MOCK_PID_WITH_URL}
  without URL:     ${MOCK_PID_WITHOUT_URL}
  deleted (redacted): ${MOCK_PID_DELETED_WITH_URL}, ${MOCK_PID_DELETED_WITHOUT_URL}
  missing:         ${MOCK_PID_MISSING}

example paths:
  /resolve/${MOCK_NAMESPACE_ID}/${MOCK_PID_WITH_URL}
  /${MOCK_MOUNT_PATH}/${MOCK_PID_WITH_URL}`}</code>
        </pre>
      </div>
    </div>
  );
}
