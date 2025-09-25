export class UIDataRecord {
  key: string;
  label: string;
  value: any;
  sortOrder: number;
  constructor(key: string, label: string, value: any, sortOrder: number) {
    this.key = key;
    this.label = label;
    this.value = value;
    this.sortOrder = sortOrder;
  }
}
