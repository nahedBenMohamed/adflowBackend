import writtenNumber from 'written-number';
import { convert as convertRu } from 'number-to-words-ru';

export class NumberUtil {
  static toWord(value: number, options?: { language?: string; currency?: string }): string {
    return options?.language === 'ru'
      ? convertRu(value, {
          currency: options?.currency as 'rub' | 'usd' | 'eur',
          showNumberParts: { fractional: false },
          showCurrency: { integer: !!options.currency, fractional: !!options.currency },
        }).toLowerCase()
      : writtenNumber(value, { lang: options?.language });
  }

  static toNumber(value: unknown): number {
    return value ? Number(value) : 0;
  }
}
