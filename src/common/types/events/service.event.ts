import { v4 as uuidv4 } from 'uuid';

export class ServiceEvent {
  source: string;
  key: string;
  prevEvent?: ServiceEvent | null;

  constructor(data: { source: string; key?: string; prevEvent?: ServiceEvent | null }) {
    this.source = data.source;
    this.key = data.key ?? uuidv4();
    this.prevEvent = data.prevEvent;
  }

  checkHistory<T extends ServiceEvent>({
    source,
    key,
    checked = [],
  }: {
    source?: string;
    key?: string;
    checked?: { source: string; key: string }[];
  }): T | null {
    if (checked.find((item) => item.source === this.source && item.key === this.key)) {
      return null;
    }
    checked.push({ source: this.source, key: this.key });

    if ((!source || this.source === source) && (!key || this.key === key)) {
      return this as unknown as T;
    }

    return this.prevEvent ? this.prevEvent.checkHistory({ source, key }) : null;
  }
}
