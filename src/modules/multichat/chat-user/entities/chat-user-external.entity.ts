import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ChatUserExternalDto } from '../dto';

@Entity()
export class ChatUserExternal {
  @PrimaryColumn()
  chatUserId: number;

  @Column()
  externalId: string;

  @Column({ nullable: true })
  firstName: string | null;

  @Column({ nullable: true })
  lastName: string | null;

  @Column({ nullable: true })
  avatarUrl: string | null;

  @Column({ nullable: true })
  phone: string | null;

  @Column({ nullable: true })
  email: string | null;

  @Column({ nullable: true })
  link: string | null;

  @Column()
  accountId: number;

  constructor(
    accountId: number,
    chatUserId: number,
    externalId: string,
    firstName: string | null,
    lastName: string | null,
    avatarUrl: string | null,
    phone: string | null,
    email: string | null,
    link: string | null,
  ) {
    this.accountId = accountId;
    this.chatUserId = chatUserId;
    this.externalId = externalId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.avatarUrl = avatarUrl;
    this.phone = phone;
    this.email = email;
    this.link = link;
  }

  public static fromDto(accountId: number, chatUserId: number, dto: ChatUserExternalDto): ChatUserExternal {
    return new ChatUserExternal(
      accountId,
      chatUserId,
      dto.externalId,
      dto.firstName,
      dto.lastName,
      dto.avatarUrl,
      dto.phone,
      dto.email,
      dto.link,
    );
  }

  public update(dto: ChatUserExternalDto): ChatUserExternal {
    this.externalId = dto.externalId ? dto.externalId : this.externalId;
    this.firstName = dto.firstName ? dto.firstName : this.firstName;
    this.lastName = dto.lastName ? dto.lastName : this.lastName;
    this.avatarUrl = dto.avatarUrl ? dto.avatarUrl : this.avatarUrl;
    this.phone = dto.phone ? dto.phone : this.phone;
    this.email = dto.email ? dto.email : this.email;
    this.link = dto.link ? dto.link : this.link;

    return this;
  }

  public toDto(): ChatUserExternalDto {
    return {
      externalId: this.externalId,
      firstName: this.firstName,
      lastName: this.lastName,
      avatarUrl: this.avatarUrl,
      phone: this.phone,
      email: this.email,
      link: this.link,
    };
  }

  public fullName() {
    return `${this.firstName} ${this.lastName ?? ''}`.trim();
  }
}
