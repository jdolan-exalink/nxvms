import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity, RoleEntity } from '@/database/entities';
import { CreateUserDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{ user: UserEntity; accessToken: string }> {
    const existingUser = await this.userRepository.findOne({
      where: [{ email: createUserDto.email }, { username: createUserDto.username }],
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      passwordHash,
    });

    const savedUser = await this.userRepository.save(user);

    const accessToken = this.jwtService.sign({
      sub: savedUser.id,
      username: savedUser.username,
      email: savedUser.email,
    });

    return { user: savedUser, accessToken };
  }

  async login(loginDto: LoginDto): Promise<{ user: UserEntity; accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findOne({ where: { username: loginDto.username } });

    if (!user || !(await bcrypt.compare(loginDto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    const accessToken = this.jwtService.sign({
      sub: user.id,
      username: user.username,
      email: user.email,
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: 604800, secret: process.env.JWT_REFRESH_SECRET }, // 7 days in seconds
    );

    return { user, accessToken, refreshToken };
  }

  async validateUser(userId: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id: userId, isActive: true } });
  }
}
