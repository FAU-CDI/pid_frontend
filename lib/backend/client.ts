import { BackendClient } from "./base";
import { FetchClient } from "./fetch-client";
import { MockClient } from "./mock-client";

export {
  BackendClient,
  isBackendError,
  type BackendError,
  type BackendResult,
  type Mount,
  type Namespace,
  type Resource,
  type ResourceByMount,
} from "./base";

export { FetchClient } from "./fetch-client";
export { MockClient } from "./mock-client";
export {
  MOCK_MOUNT,
  MOCK_MOUNT_BASE_URI,
  MOCK_MOUNT_PATH,
  MOCK_NAMESPACE,
  MOCK_NAMESPACE_ID,
  MOCK_PID_DELETED_WITHOUT_URL,
  MOCK_PID_DELETED_WITH_URL,
  MOCK_PID_MISSING,
  MOCK_PID_WITHOUT_URL,
  MOCK_PID_WITH_URL,
  MOCK_RESOLVER_URL,
  MOCK_RESOURCES,
} from "./mock-data";

function useMockClient(): boolean {
  const value = process.env.USE_MOCK_CLIENT?.trim().toLowerCase();
  return value === "true" || value === "1" || value === "yes";
}

/**
 * Factory: MockClient when `USE_MOCK_CLIENT` is set; otherwise FetchClient
 * using `BACKEND_URL` as the API base URI.
 */
export function getBackendClient(): BackendClient {
  if (useMockClient()) {
    return new MockClient();
  }
  return new FetchClient(process.env.BACKEND_URL);
}
