import { Column, Entity, PrimaryColumn } from 'typeorm';

import { IndustryCode } from '../../common/enums/industry-code.enum';

@Entity()
export class Industry {
  @PrimaryColumn()
  code: IndustryCode;

  @Column()
  name: string;

  @Column()
  color: string;

  @Column()
  sortOrder: number;

  @Column()
  active: boolean;
}
