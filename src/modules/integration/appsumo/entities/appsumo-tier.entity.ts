import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AppsumoTier {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  tier: number;

  @Column()
  userLimit: number;

  @Column()
  termInDays: number;

  @Column()
  planName: string;

  constructor(tier: number, userLimit: number, termInDays: number, planName: string) {
    this.tier = tier;
    this.userLimit = userLimit;
    this.termInDays = termInDays;
    this.planName = planName;
  }
}
