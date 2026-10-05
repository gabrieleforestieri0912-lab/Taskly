export function getSectionLabel(section: string): string {
  return section
    .split("-")
    .map((word) => word.charAt(0).toLocaleUpperCase("it") + word.slice(1))
    .join(" ");
}
