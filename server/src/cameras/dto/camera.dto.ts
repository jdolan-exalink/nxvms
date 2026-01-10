import { IsString, IsOptional, IsUrl, IsUUID, IsBoolean, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RecordingMode } from '../../database/entities/recording-schedule.entity';

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  serverId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  frigateCameraName?: string;
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
  @IsString()
  rtspUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  serverId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRecording?: boolean;

  @ApiPropertyOptional({ enum: RecordingMode })
  @IsOptional()
  @IsEnum(RecordingMode)
  recordingMode?: RecordingMode;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  zones?: any[];
}
