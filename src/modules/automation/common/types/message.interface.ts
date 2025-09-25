import { Signal } from './signal.interface';

export interface Message extends Signal {
  correlationKey?: string;
}
