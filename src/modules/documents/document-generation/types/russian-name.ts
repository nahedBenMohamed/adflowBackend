import { incline } from 'lvovich';

import { type RussianCase } from '../enums';

export class RussianName {
  first?: string | null;
  middle?: string | null;
  last?: string | null;

  constructor(last?: string | null, first?: string | null, middle?: string | null) {
    this.first = first;
    this.middle = middle;
    this.last = last;
  }

  public static fromFullName(fullName: string): RussianName {
    const [last, first, middle] = fullName.split(' ');

    return new RussianName(last, first, middle);
  }

  public getFullName(russianCase?: RussianCase): string {
    if (russianCase) {
      const { last, first, middle } = incline({ last: this.last, first: this.first, middle: this.middle }, russianCase);
      return `${last}${first ? ` ${first}` : ''}${middle ? ` ${middle}` : ''}`;
    }

    return `${this.last}${this.first ? ` ${this.first}` : ''}${this.middle ? ` ${this.middle}` : ''}`;
  }
}
