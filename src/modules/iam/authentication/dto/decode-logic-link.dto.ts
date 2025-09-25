import { PickType } from '@nestjs/swagger';

import { LoginLinkDto } from './login-link.dto';

export class DecodeLogicLinkDto extends PickType(LoginLinkDto, ['loginLink'] as const) {}
