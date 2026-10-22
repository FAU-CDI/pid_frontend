import {
  MOCK_MOUNT_PATH,
  MOCK_PID_WITH_URL,
} from "@/lib/backend/mock-data";

/** Default Resolve-field example: mock mount path + active PID with URL. */
export const DEFAULT_RESOLVE_EXAMPLE = `${MOCK_MOUNT_PATH}/${MOCK_PID_WITH_URL}`;

/**
 * Placeholder text for the global Resolve field.
 * Uses `RESOLVE_EXAMPLE` when set; otherwise {@link DEFAULT_RESOLVE_EXAMPLE}.
 */
export function resolveExamplePlaceholder(): string {
  const fromEnv = process.env.RESOLVE_EXAMPLE?.trim();
  return fromEnv || DEFAULT_RESOLVE_EXAMPLE;
}
