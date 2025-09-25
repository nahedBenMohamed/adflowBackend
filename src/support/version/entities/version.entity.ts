import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { VersionDto } from '../dto/version.dto';
import { DateUtil } from '@/common';
import type { CreateVersionDto } from '../dto/create-version.dto';

@Entity()
export class Version {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ type: 'varchar', length: 16, unique: true })
  version: string;

  @Column({ type: 'timestamp without time zone' })
  date: Date;

  constructor(version: string) {
    this.version = version;
    this.date = DateUtil.now();
  }

  static fromDto(dto: CreateVersionDto): Version {
    return new Version(dto.version);
  }

  public toDto(): VersionDto {
    return {
      id: this.id,
      version: this.version,
      date: this.date.toISOString(),
    };
  }
}
