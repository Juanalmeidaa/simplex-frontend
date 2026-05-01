export class CurrencyInputFormatter {
  static format(value: string): string {
    const digits = value.replace(/[^\d]/g, '');
    
    if (!digits) return '';
    
    const numberValue = parseInt(digits, 10);
    
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numberValue);
  }

  static formatValue(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  static parse(value: string): number {
    const cleaned = value
      .replace(/R\$\s?/g, '')
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(',', '.');

    return Math.round(parseFloat(cleaned) * 100);
  }

  static parseToCents(value: string): number {
    const cleaned = value
      .replace(/R\$\s?/g, '')
      .replace(/[^\d.,]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');

    const parsed = parseFloat(cleaned);
    if (isNaN(parsed)) return 0;

    return Math.round(parsed * 100);
  }

  static parseToFloat(value: string): number {
    const cleaned = value
      .replace(/R\$\s?/g, '')
      .replace(/\./g, '')
      .replace(',', '.');

    return parseFloat(cleaned) || 0;
  }

  static toStorage(value: string): number {
    const digits = value.replace(/[^\d]/g, '');
    return parseInt(digits, 10) || 0;
  }

  static fromStorage(cents: number): string {
    if (!cents) return '';
    
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cents);
  }
}