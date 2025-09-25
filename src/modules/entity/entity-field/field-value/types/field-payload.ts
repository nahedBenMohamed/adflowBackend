export interface FieldPayloadValue<T> {
  value: T | null;
}

export interface FieldPayloadValues<T> {
  values: T[] | null;
}

export interface FieldPayloadOption {
  optionId: number | null;
}

export interface FieldPayloadOptions {
  optionIds: number[] | null;
}

export interface FieldPayloadParticipants {
  userIds: number[] | null;
}

export interface FieldPayloadChecklistItem {
  text: string;
  checked: boolean;
}
