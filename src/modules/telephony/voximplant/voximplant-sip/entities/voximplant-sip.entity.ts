import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { PbxProviderType } from '../enums';
import { VoximplantSIPDto } from '../dto';
import { VoximplantSIPRegistration } from '../types';
import { VoximplantSipUser } from './voximplant-sip-user.entity';

@Entity()
export class VoximplantSip {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  externalId: number;

  @Column()
  type: PbxProviderType;

  @Column()
  name: string;

  constructor(accountId: number, externalId: number, type: PbxProviderType, name: string) {
    this.accountId = accountId;
    this.externalId = externalId;
    this.type = type;
    this.name = name;
  }

  private _users: VoximplantSipUser[] | null | undefined;
  public get users(): VoximplantSipUser[] | null | undefined {
    return this._users;
  }
  public set users(value: VoximplantSipUser[] | null | undefined) {
    this._users = value;
  }

  private _registration: VoximplantSIPRegistration | null;
  public get registration(): VoximplantSIPRegistration | null {
    return this._registration;
  }
  public set registration(value: VoximplantSIPRegistration | null) {
    this._registration = value;
  }

  public toDto(): VoximplantSIPDto {
    return new VoximplantSIPDto({
      id: this.id,
      externalId: this.externalId,
      type: this.type,
      name: this.name,
      userIds: this._users?.map((u) => u.userId),
      registration: this.registration,
    });
  }
}
