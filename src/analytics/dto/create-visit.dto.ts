import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVisitDto {
  @IsString()
  @IsNotEmpty()
  fingerprint: string;

  @IsString()
  @IsNotEmpty()
  path: string;
}
