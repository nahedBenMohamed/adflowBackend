import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { DemoDataType } from '../../common/enums/demo-data-type.enum';

@Entity()
export class DemoData {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  type: DemoDataType;

  @Column('simple-array', { name: 'ids' })
  private _ids: string[];

  constructor(accountId: number, type: DemoDataType, ids: number[]) {
    this.accountId = accountId;
    this.type = type;
    this.ids = ids;
  }

  public get ids(): number[] {
    return this._ids?.map((id) => Number(id)) || [];
  }
  public set ids(value: number[]) {
    this._ids = value?.map((id) => id.toString()) || [];
  }
}
