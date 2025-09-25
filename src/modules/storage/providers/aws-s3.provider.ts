import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { AwsConfig } from '../config/aws.config';

@Injectable()
export class AwsS3Provider {
  private readonly logger = new Logger(AwsS3Provider.name);
  private s3Client: S3Client;
  private _bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this._bucketName = this.configService.get<AwsConfig>('aws').bucket;

    this.s3Client = new S3Client({});
  }

  public async storeBuffer(
    key: string,
    buffer: Buffer,
    sha256Hash: string,
    mimeType: string,
    originalName: string,
  ): Promise<boolean> {
    try {
      const param = {
        Bucket: this._bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ChecksumSHA256: sha256Hash,
        ContentDisposition: originalName ? `attachment; filename="${encodeURI(originalName)}"` : originalName,
      };
      await this.s3Client.send(new PutObjectCommand(param));
      return true;
    } catch (e) {
      this.logger.error(`Error in AwsS3Provider`, (e as Error)?.stack);
      return false;
    }
  }

  public async deleteFile(key: string): Promise<boolean> {
    try {
      await this.s3Client.send(new DeleteObjectCommand({ Bucket: this._bucketName, Key: key }));
      return true;
    } catch (e) {
      return false;
    }
  }

  public async getFile(key: string): Promise<Uint8Array> {
    try {
      const data = await this.s3Client.send(new GetObjectCommand({ Bucket: this._bucketName, Key: key }));
      return await data?.Body?.transformToByteArray();
    } catch (e) {
      return null;
    }
  }
}
