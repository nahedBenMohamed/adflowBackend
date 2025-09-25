import { PickType } from '@nestjs/swagger';
import { UserTokenDto } from './user-token.dto';

export class CreateUserTokenDto extends PickType(UserTokenDto, ['name', 'expiresAt'] as const) {}
