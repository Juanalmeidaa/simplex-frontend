export class DateFormatter {
  private static readonly dateFormatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  private static readonly monthYearFormatter = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  private static readonly shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

  static format(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return this.dateFormatter.format(dateObj);
  }

  static formatMonthYear(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return this.monthYearFormatter.format(dateObj);
  }

  static formatShort(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return this.shortDateFormatter.format(dateObj);
  }

  static toISO(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  }

  static parse(value: string): Date {
    const [day, month, year] = value.split('/').map(Number);
    return new Date(year, month - 1, day);
  }
}