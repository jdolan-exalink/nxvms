import { IsString, IsOptional, IsUrl, IsUUID, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCameraDto {
  @ApiProperty({ example: 'Front Door Camera' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Main entrance camera' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'rtsp://192.168.1.100:554/stream1' })
  @IsUrl()
  rtspUrl: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  onvifId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  location?: { latitude?: number; longitude?: number; address?: string };
}

export class UpdateCameraDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRecording?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  tags?: string[];
}
