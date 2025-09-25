import { Injectable } from '@nestjs/common';

import { TokenService, UrlGeneratorService } from '@/common';

const Paths = {
  downloadPath: '/api/storage/file/:fileId',
  imagePath: '/api/storage/image/:accountId/:fileId',
  temporaryPath: '/api/storage/tmp/:token',
} as const;

@Injectable()
export class StorageUrlService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly urlGenerator: UrlGeneratorService,
  ) {}

  public getDownloadUrl(subdomain: string, fileId: string): string {
    return this.urlGenerator.createUrl({ route: Paths.downloadPath, subdomain, path: { fileId } });
  }

  public getImageUrl(accountId: number, subdomain: string, fileId: string): string {
    return this.urlGenerator.createUrl({
      route: Paths.imagePath,
      subdomain,
      path: { accountId: accountId.toString(), fileId },
    });
  }

  public getTemporaryUrl(fileId: string, subdomain?: string): string {
    const token = this.tokenService.create({ fileId }, { expiresIn: '15m' });
    return this.urlGenerator.createUrl({ route: Paths.temporaryPath, subdomain, path: { token } });
  }
}
