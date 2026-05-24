export class DateFormatter {
  private static readonly TIMEZONE = 'America/Sao_Paulo';

  private static toBrasiliaDate(date: Date | string): Date {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const brasiliaStr = dateObj.toLocaleString('en-US', { timeZone: this.TIMEZONE });
    return new Date(brasiliaStr);
  }

  private static readonly dateFormatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: this.TIMEZONE,
  });

  private static readonly monthYearFormatter = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: this.TIMEZONE,
  });

  private static readonly shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    timeZone: this.TIMEZONE,
  });

  static format(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(this.fromAPI(date)) : date;
    return this.dateFormatter.format(dateObj);
  }

  static formatMonthYear(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(this.fromAPI(date)) : date;
    return this.monthYearFormatter.format(dateObj);
  }

  static formatShort(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(this.fromAPI(date)) : date;
    return this.shortDateFormatter.format(dateObj);
  }

  static toISO(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(this.fromAPI(date)) : date;
    return dateObj.toISOString().split('T')[0];
  }

  static toBrasiliaDateString(date: Date | string): string {
    const normalized = typeof date === 'string' ? this.fromAPI(date) : date;
    const dateObj = typeof normalized === 'string' ? new Date(normalized) : normalized;
    const parts = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: this.TIMEZONE,
    }).formatToParts(dateObj);

    const year = parts.find(p => p.type === 'year')!.value;
    const month = parts.find(p => p.type === 'month')!.value;
    const day = parts.find(p => p.type === 'day')!.value;

    return `${year}-${month}-${day}`;
  }

  static toUTCISOString(localDateStr: string): string {
    const dateOnly = localDateStr.includes('T') ? localDateStr.split('T')[0]! : localDateStr;
    return dateOnly;
  }

  static nowBrasilia(): string {
    return this.toBrasiliaDateString(new Date());
  }

  static parse(value: string): Date {
    const [day, month, year] = value.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  static fromAPI(dateStr: string): string {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return `${dateStr}T12:00:00.000Z`;
    }
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(dateStr)) {
      const dateOnly = dateStr.slice(0, 10);
      return `${dateOnly}T12:00:00.000Z`;
    }
    return dateStr;
  }

  static toAPI(dateStr: string): string {
    if (dateStr.includes('T')) return dateStr.split('T')[0]!;
    return dateStr;
  }
}
