import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VersionService } from './version.service';
import { VersionController } from './version.controller';
import { Version } from './entities/version.entity';
import { IAMModule } from '@/modules/iam/iam.module';

@Module({
  imports: [TypeOrmModule.forFeature([Version]), IAMModule],
  providers: [VersionService],
  controllers: [VersionController],
})
export class VersionModule {}
