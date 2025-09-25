import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { UserRole } from '../../common/enums/user-role.enum';
import { ObjectPermissionDto } from '../../object-permission/dto/object-permission.dto';

export class UserDto {
  @ApiProperty({ description: 'User ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'User first name' })
  @IsString()
  firstName: string;

  @ApiProperty({ nullable: true, description: 'User last name' })
  @IsOptional()
  @IsString()
  lastName: string | null;

  @ApiProperty({ description: 'User email' })
  @IsString()
  email: string;

  @ApiProperty({ nullable: true, description: 'User phone' })
  @IsOptional()
  @IsString()
  phone: string | null;

  @ApiProperty({ enum: UserRole, description: 'User role' })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ description: 'Is user active' })
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({ type: [ObjectPermissionDto], nullable: true, description: 'User object permissions' })
  @IsArray()
  @IsOptional()
  objectPermissions?: ObjectPermissionDto[] | null;

  @ApiPropertyOptional({ nullable: true, description: 'User department ID' })
  @IsOptional()
  @IsNumber()
  departmentId?: number | null;

  @ApiPropertyOptional({ nullable: true, description: 'User position' })
  @IsOptional()
  @IsString()
  position?: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'User analytics ID' })
  @IsOptional()
  @IsString()
  analyticsId?: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'User avatar URL' })
  @IsOptional()
  @IsString()
  avatarUrl?: string | null;

  @ApiPropertyOptional({ type: [Number], nullable: true, description: 'Accessible user IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  accessibleUserIds?: number[] | null;

  isPlatformAdmin: boolean;
}
