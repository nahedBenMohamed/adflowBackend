import { Column, Entity, PrimaryColumn } from 'typeorm';

import { IndustryCode } from '../../common/enums/industry-code.enum';
import { ReadyMadeSolutionDto } from '../dto/ready-made-solution.dto';

@Entity()
export class ReadyMadeSolution {
  @PrimaryColumn()
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  accountId: number | null;

  @Column()
  sortOrder: number;

  @Column()
  active: boolean;

  @Column()
  industryCode: IndustryCode | null;

  public toDto(): ReadyMadeSolutionDto {
    return new ReadyMadeSolutionDto(this.code, this.name);
  }
}
