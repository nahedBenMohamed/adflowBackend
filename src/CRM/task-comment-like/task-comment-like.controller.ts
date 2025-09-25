import { Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { TaskCommentLikeDto } from './dto';
import { TaskCommentLikeService } from './task-comment-like.service';

@ApiTags('crm/task-comments')
@Controller('crm/tasks/:taskId/comments/:commentId')
@JwtAuthorized()
@TransformToDto()
export class TaskCommentLikeController {
  constructor(private readonly service: TaskCommentLikeService) {}

  @ApiOperation({ summary: 'Like task comment', description: 'Like task comment for current user' })
  @ApiParam({ name: 'taskId', type: Number, required: true, description: 'Task ID' })
  @ApiParam({ name: 'commentId', type: Number, required: true, description: 'Comment ID' })
  @ApiCreatedResponse({ type: TaskCommentLikeDto, description: 'Task comment like' })
  @Post('like')
  public async like(
    @CurrentAuth() { accountId, userId }: AuthData,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    return await this.service.like({ accountId, userId, commentId });
  }

  @ApiOperation({ summary: 'Unlike task comment', description: 'Unlike task comment for current user' })
  @ApiParam({ name: 'taskId', type: Number, required: true, description: 'Task ID' })
  @ApiParam({ name: 'commentId', type: Number, required: true, description: 'Comment ID' })
  @ApiOkResponse()
  @Post('unlike')
  public async unlike(
    @CurrentAuth() { accountId, userId }: AuthData,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    return await this.service.unlike({ accountId, userId, commentId });
  }
}
