import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { ForbiddenError } from '@/common';

import { SupportConfig } from '../config';
import { CreateVersionDto, CurrentVersionDto } from './dto';
import { Version } from './entities';

const cacheKey = 'Version:latest';

@Injectable()
export class VersionService {
  private readonly _config: SupportConfig | undefined;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Version)
    private readonly repository: Repository<Version>,
    private readonly dataSource: DataSource,
  ) {
    this._config = this.configService.get<SupportConfig>('support');
  }

  async create(dto: CreateVersionDto): Promise<Version> {
    if (this._config?.accessCode && this._config.accessCode === dto.code) {
      await this.dataSource.queryResultCache?.remove([cacheKey]);

      return this.repository.save(Version.fromDto(dto));
    } else {
      throw new ForbiddenError();
    }
  }

  async getLatest({ currentVersion }: CurrentVersionDto): Promise<Version | null> {
    const isLatestGreater = ({
      currentVersion,
      latestVersion,
    }: {
      currentVersion: string;
      latestVersion: string;
    }): boolean => {
      const currentVersionParts = currentVersion.split('.').map((p) => parseInt(p, 10));
      const latestVersionParts = latestVersion.split('.').map((p) => parseInt(p, 10));

      // Ensure both versions have the same length by padding with zeroes
      const maxLength = Math.max(currentVersionParts.length, latestVersionParts.length);

      for (let i = 0; i < maxLength; i++) {
        const currentVersionPart = currentVersionParts[i] || 0;
        const latestVersionPart = latestVersionParts[i] || 0;

        if (currentVersionPart < latestVersionPart) return true;
        if (currentVersionPart > latestVersionPart) return false;
      }

      return false; // Versions are equal
    };

    const latestVersion = await this.repository
      .createQueryBuilder('version')
      .orderBy('version.date', 'DESC')
      .limit(1)
      .cache(cacheKey, 1209600000)
      .getOne();

    return latestVersion && isLatestGreater({ currentVersion, latestVersion: latestVersion.version })
      ? latestVersion
      : null;
  }
}
