import {
  MOCK_MOUNT_PATH,
  MOCK_PID_WITH_URL,
} from "@/lib/backend/mock-data";

/**
 * Default Resolve-field example: mock mount path + active PID with URL.
 * Form is always `{mount}/{pid}` with a single-segment mount.
 */
export const DEFAULT_RESOLVE_EXAMPLE = `${MOCK_MOUNT_PATH}/${MOCK_PID_WITH_URL}`;

/**
 * Placeholder text for the global Resolve field and homepage example card.
 * Uses `RESOLVE_EXAMPLE` when set; otherwise {@link DEFAULT_RESOLVE_EXAMPLE}.
 * Expected value: `{mount}/{pid}` (single-segment mount), e.g. `demo/123`.
 * The homepage “See an example” card links to that mount PID page.
 */
export function resolveExamplePlaceholder(): string {
  const fromEnv = process.env.RESOLVE_EXAMPLE?.trim();
  return fromEnv || DEFAULT_RESOLVE_EXAMPLE;
}

/**
 * Split a Resolve example into mount and PID.
 * Assumes `{mount}/{pid}` with a single-segment mount (homepage contract).
 */
export function parseResolveExample(
  example = resolveExamplePlaceholder()
): { mount: string; pid: string } | null {
  const trimmed = example.trim();
  const slash = trimmed.indexOf("/");
  if (slash <= 0 || slash !== trimmed.lastIndexOf("/") || slash === trimmed.length - 1) {
    return null;
  }
  return {
    mount: trimmed.slice(0, slash),
    pid: trimmed.slice(slash + 1),
  };
}
