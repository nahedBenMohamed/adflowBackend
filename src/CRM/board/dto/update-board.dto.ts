import { PartialType, PickType } from '@nestjs/swagger';

import { BoardDto } from './board.dto';

export class UpdateBoardDto extends PartialType(PickType(BoardDto, ['name', 'sortOrder', 'participantIds'] as const)) {}
