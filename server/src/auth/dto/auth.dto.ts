import { IsEmail, IsString, MinLength, IsUUID, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Administrator' })
  @IsString()
  displayName: string;

  @ApiProperty({ example: 'SecurePassword123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  roleId: string;
}

export class LoginDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'password' })
  @IsString()
  password: string;
}

export class UpdatePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}
