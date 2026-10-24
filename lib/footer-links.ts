/**
 * Optional footer (or homepage About) href: non-empty trimmed string, otherwise omit the link.
 * Same rules as About / Imprint / Privacy / Accessibility.
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
