import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DepartmentSettings } from '../../department-settings';
import { CreateDepartmentDto, DepartmentDto, UpdateDepartmentDto } from '../dto';

@Entity()
export class Department {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  parentId: number | null;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  accountId: number;

  constructor(accountId: number, name: string, parentId: number | null, isActive = true) {
    this.accountId = accountId;
    this.name = name;
    this.parentId = parentId;
    this.isActive = isActive;
  }

  private _subordinates: Department[];
  public get subordinates(): Department[] {
    return this._subordinates;
  }
  public set subordinates(value: Department[]) {
    this._subordinates = value;
  }

  private _settings: DepartmentSettings;
  public get settings(): DepartmentSettings {
    return this._settings;
  }
  public set settings(value: DepartmentSettings) {
    this._settings = value;
  }

  public static fromDto(accountId: number, dto: CreateDepartmentDto): Department {
    return new Department(accountId, dto.name, dto.parentId);
  }

  public update(dto: UpdateDepartmentDto): Department {
    this.name = dto.name ?? this.name;
    this.isActive = dto.isActive !== undefined ? dto.isActive : this.isActive;

    return this;
  }

  public toDto(): DepartmentDto {
    return {
      id: this.id,
      name: this.name,
      parentId: this.parentId,
      isActive: this.isActive,
      settings: this.settings?.toDto(),
      subordinates: this.subordinates ? this.subordinates.map((s) => s.toDto()) : [],
    };
  }
}
