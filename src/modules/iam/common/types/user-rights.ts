import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UserRights {
  @ApiProperty({ description: 'Can view' })
  @IsBoolean()
  canView: boolean;

  @ApiProperty({ description: 'Can edit' })
  @IsBoolean()
  canEdit: boolean;

  @ApiProperty({ description: 'Can delete' })
  @IsBoolean()
  canDelete: boolean;

  public static full(): UserRights {
    return { canView: true, canEdit: true, canDelete: true };
  }
  public static none(): UserRights {
    return { canView: false, canEdit: false, canDelete: false };
  }
}
