import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';

import awsConfig from './config/aws.config';
import { FileInfo } from './entities/file-info.entity';
import { AwsS3Provider } from './providers/aws-s3.provider';
import { StorageService } from './storage.service';
import { StorageUrlService } from './storage-url.service';
import { StorageController } from './storage.controller';
import { StoragePublicController } from './storage-public.controller';

@Module({
  imports: [
    MulterModule.register(),
    ConfigModule.forFeature(awsConfig),
    TypeOrmModule.forFeature([FileInfo]),
    forwardRef(() => IAMModule),
  ],
  providers: [StorageService, StorageUrlService, AwsS3Provider],
  controllers: [StorageController, StoragePublicController],
  exports: [StorageService, StorageUrlService],
})
export class StorageModule {}
