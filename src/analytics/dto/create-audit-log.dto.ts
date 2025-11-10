import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateAuditLogDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  action: string;

  @IsString()
  @IsOptional()
  resourceId?: string;
}
