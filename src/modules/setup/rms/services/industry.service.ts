import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IndustryDto } from '../dto/industry.dto';
import { Industry } from '../entities/industry.entity';
import { RmsService } from './rms.service';

@Injectable()
export class IndustryService {
  constructor(
    @InjectRepository(Industry)
    private readonly repository: Repository<Industry>,
    private readonly rmsService: RmsService,
  ) {}

  public async getIndustryDtos(): Promise<IndustryDto[]> {
    const industries = await this.repository
      .createQueryBuilder()
      .where({ active: true })
      .orderBy('sort_order', 'ASC')
      .getMany();
    const solutions = await this.rmsService.findMany({ isActive: true });

    const industryDtos: IndustryDto[] = [];
    for (const industry of industries) {
      const solutionDtos = solutions.filter((s) => s.industryCode === industry.code).map((s) => s.toDto());
      industryDtos.push(IndustryDto.fromModel(industry, solutionDtos));
    }

    return industryDtos;
  }
}
