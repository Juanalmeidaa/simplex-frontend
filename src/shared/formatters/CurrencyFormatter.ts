export class CurrencyFormatter {
  private static readonly formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  static format(cents: number): string {
    return this.formatter.format(Math.round(cents) / 100);
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

    const parts = cleaned.split('.');
    if (parts.length === 1) {
      return Math.round(Number(parts[0]) * 100);
    }

    const integerPart = parts[0]!;
    const decimalPart = (parts[1] || '').padEnd(2, '0').slice(0, 2);
    const cents = parseInt(integerPart + decimalPart, 10);
    return isNaN(cents) ? 0 : cents;
  }
}
