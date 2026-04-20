export function formatMoney(amount: number, currency: string, language: string = 'en'): string {
  return new Intl.NumberFormat(language, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}
