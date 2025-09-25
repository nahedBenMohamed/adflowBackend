import { OmitType } from '@nestjs/swagger';

import { UserProfileDto } from './user-profile.dto';

export class UpdateUserProfileDto extends OmitType(UserProfileDto, ['userId'] as const) {}
