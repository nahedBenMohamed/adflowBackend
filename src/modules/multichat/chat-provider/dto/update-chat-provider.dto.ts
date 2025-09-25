import { PartialType, PickType } from '@nestjs/swagger';

import { ChatProviderDto } from './chat-provider.dto';

export class UpdateChatProviderDto extends PartialType(
  PickType(ChatProviderDto, [
    'title',
    'status',
    'messagePerDay',
    'accessibleUserIds',
    'responsibleUserIds',
    'supervisorUserIds',
    'entitySettings',
  ] as const),
) {}
