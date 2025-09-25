import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ExternalSystem {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column('character varying', { array: true })
  urlTemplates: string[];
}
