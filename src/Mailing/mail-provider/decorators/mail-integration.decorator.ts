import { SetMetadata } from '@nestjs/common';

export const MAIL_PROVIDER_KEY = 'mail:provider';

export const MailIntegration = (provider: string): ClassDecorator => SetMetadata(MAIL_PROVIDER_KEY, provider);
