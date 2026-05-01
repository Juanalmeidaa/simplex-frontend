export class CurrencyFormatter {
  private static readonly formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  static format(cents: number): string {
    return this.formatter.format(cents / 100);
  }

  static formatValue(value: number): string {
    return this.formatter.format(value);
  }

  static parse(value: string): number {
    const cleaned = value
      .replace('R$', '')
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(',', '.');

    const parsed = parseFloat(cleaned);
    return Math.round(parsed * 100);
  }
}