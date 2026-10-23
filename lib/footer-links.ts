/**
 * Optional footer href: non-empty trimmed string, otherwise omit the link.
 * Same rules as Imprint / Privacy / Accessibility.
 */
export function optionalFooterHref(
  value: string | undefined
): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed;
}
