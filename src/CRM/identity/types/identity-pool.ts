import { SequenceName } from '../../common';
import { IdentityPoolDto } from '../dto';

export class IdentityPool {
  name: SequenceName;
  values: number[];

  constructor({ name, values }: { name: SequenceName; values: number[] }) {
    this.name = name;
    this.values = values;
  }

  public toDto(): IdentityPoolDto {
    return { name: this.name, values: this.values };
  }
}
