import { IsInt, IsEnum, IsOptional, IsString, IsArray, ValidateNested, IsUUID, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RecordingMode } from '../../database/entities/recording-schedule.entity';

export class RecordingScheduleItemDto {
    @ApiProperty({ example: 1, description: 'Day of week (0=Sunday, 1=Monday, ...)' })
    @IsInt()
    @Min(0)
    @Max(6)
    dayOfWeek: number;

    @ApiProperty({ example: 14, description: 'Hour (0-23)' })
    @IsInt()
    @Min(0)
    @Max(23)
    hour: number;

    @ApiProperty({ enum: RecordingMode, example: RecordingMode.ALWAYS })
    @IsEnum(RecordingMode)
    mode: RecordingMode;

    @ApiPropertyOptional({ example: 15 })
    @IsOptional()
    @IsInt()
    fps?: number;

    @ApiPropertyOptional({ example: 'high' })
    @IsOptional()
    @IsString()
    quality?: string;
}

export class UpdateRecordingScheduleDto {
    @ApiProperty({ type: [RecordingScheduleItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RecordingScheduleItemDto)
    schedule: RecordingScheduleItemDto[];
}

export class CopyScheduleDto {
    @ApiProperty({ description: 'ID of the source camera to copy from' })
    @IsUUID()
    targetCameraIds: string[];

    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    includeArchiveLengthSettings?: boolean;
}
