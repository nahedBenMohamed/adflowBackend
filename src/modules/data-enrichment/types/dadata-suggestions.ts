import { DadataSuggestion } from './dadata-suggestion';

export interface DadataSuggestions<T> {
  suggestions?: DadataSuggestion<T>[] | null;
}
