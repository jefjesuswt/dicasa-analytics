import { IsNotEmpty, IsUUID } from 'class-validator';

export class HeartbeatDto {
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;
}
