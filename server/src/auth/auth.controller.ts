import { Controller, Post, Get, Body, UseGuards, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, CreateUserDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserEntity } from '@/database/entities';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
  private readonly logger = new Logger('AuthController');

  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered' })
  async register(@Body() createUserDto: CreateUserDto) {
    this.logger.log(`📝 Register attempt: username=${createUserDto.username}`);
    try {
      const result = await this.authService.register(createUserDto);
      this.logger.log(`✅ Registration successful: ${createUserDto.username}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Registration failed: ${error.message}`);
      throw error;
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and get JWT token' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`🔑 Login attempt: username=${loginDto.username}`);
    this.logger.debug(`📦 Login request body: ${JSON.stringify({ username: loginDto.username, passwordLength: loginDto.password?.length })}`);
    try {
      const result = await this.authService.login(loginDto);
      this.logger.log(`✅ Login successful: ${loginDto.username}, userId=${result.user.id}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Login failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Current user' })
  async getMe(@CurrentUser() user: UserEntity) {
    return user;
  }
}
