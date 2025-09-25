import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RentalInterval } from './entities/rental-interval.entity';
import { RentalIntervalDto } from './dto/rental-interval.dto';

@Injectable()
export class RentalIntervalService {
  constructor(
    @InjectRepository(RentalInterval)
    private readonly repository: Repository<RentalInterval>,
  ) {}

  public async findRentalInterval(accountId: number, sectionId: number): Promise<RentalInterval | null> {
    return await this.repository.findOneBy({ accountId, sectionId });
  }

  public async setRentalInterval(
    accountId: number,
    sectionId: number,
    dto: RentalIntervalDto,
  ): Promise<RentalInterval> {
    const interval = await this.findRentalInterval(accountId, sectionId);

    return interval
      ? await this.repository.save(interval.update(dto))
      : await this.repository.save(RentalInterval.create(accountId, sectionId, dto));
  }
}
