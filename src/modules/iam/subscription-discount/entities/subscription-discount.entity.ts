import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SubscriptionDiscount {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  days: number;

  @Column()
  percent: number;

  @Column({ nullable: true })
  code: string | null;

  @Column({ nullable: true })
  validUntil: Date | null;

  constructor(days: number, percent: number, code?: string | null, validUntil?: Date | null) {
    this.days = days;
    this.percent = percent;
    this.code = code ?? null;
    this.validUntil = validUntil ?? null;
  }
}
