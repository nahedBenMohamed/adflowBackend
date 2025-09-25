import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { CreateVoximplantNumberDto, UpdateVoximplantNumberDto, VoximplantNumberDto } from '../dto';
import { VoximplantNumberUser } from './voximplant-number-user.entity';

@Entity()
export class VoximplantNumber {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  externalId: string | null;

  constructor(accountId: number, phoneNumber: string, externalId: string | null) {
    this.accountId = accountId;
    this.phoneNumber = phoneNumber;
    this.externalId = externalId;
  }

  private _users: VoximplantNumberUser[] | null | undefined;
  public get users(): VoximplantNumberUser[] | null | undefined {
    return this._users;
  }
  public set users(value: VoximplantNumberUser[] | null | undefined) {
    this._users = value;
  }

  public static fromDto(accountId: number, dto: CreateVoximplantNumberDto): VoximplantNumber {
    return new VoximplantNumber(accountId, dto.phoneNumber, dto.externalId);
  }

  public update(dto: UpdateVoximplantNumberDto): VoximplantNumber {
    this.phoneNumber = dto.phoneNumber !== undefined ? dto.phoneNumber : this.phoneNumber;
    this.externalId = dto.externalId !== undefined ? dto.externalId : this.externalId;

    return this;
  }

  public toDto(): VoximplantNumberDto {
    return new VoximplantNumberDto({ ...this, userIds: this._users?.map((u) => u.userId) });
  }
}
