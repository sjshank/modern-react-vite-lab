export function createCountReport(count: number): string {
  const formatter = new Intl.NumberFormat('en-US');
  return `Current count: ${formatter.format(count)}. Next count: ${formatter.format(count + 1)}.`;
}
