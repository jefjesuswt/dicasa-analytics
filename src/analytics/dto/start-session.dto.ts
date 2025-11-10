import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class StartSessionDto {
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  fingerprint: string;
}
