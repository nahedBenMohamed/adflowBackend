import { Column, Entity, PrimaryColumn } from 'typeorm';

import { UpdateVoximplantUserDto, VoximplantUserDto } from '../dto';

@Entity()
export class VoximplantUser {
  @PrimaryColumn()
  userId: number;

  @Column()
  externalId: number;

  @Column()
  userName: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  accountId: number;

  constructor(
    accountId: number,
    userId: number,
    externalId: number,
    userName: string,
    password: string,
    isActive = true,
  ) {
    this.accountId = accountId;
    this.userId = userId;
    this.externalId = externalId;
    this.userName = userName;
    this.password = password;
    this.isActive = isActive;
  }

  public update(dto: UpdateVoximplantUserDto): VoximplantUser {
    if (dto.isActive !== undefined) {
      this.isActive = dto.isActive;
    }

    return this;
  }

  public toDto(): VoximplantUserDto {
    return new VoximplantUserDto(this);
  }
}
