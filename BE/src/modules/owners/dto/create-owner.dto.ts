import { IsString, IsOptional } from 'class-validator';

export class CreateOwnerDto {
  @IsString()
  readonly name: string;

  @IsString()
  @IsOptional()
  readonly contact?: string;

  @IsString()
  @IsOptional()
  readonly address?: string;
}
