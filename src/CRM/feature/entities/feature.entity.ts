import { Column, Entity, PrimaryColumn } from 'typeorm';

import { FeatureDto } from '../dto';

@Entity()
export class Feature {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column()
  isEnabled: boolean;

  constructor(id: number, name: string, code: string, isEnabled: boolean) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.isEnabled = isEnabled;
  }

  public toDto(): FeatureDto {
    return new FeatureDto(this.id, this.name, this.code, this.isEnabled);
  }
}
