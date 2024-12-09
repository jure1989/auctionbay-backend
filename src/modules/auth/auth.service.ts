import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { User } from 'entities/user.entity'
import { Request } from 'express'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from 'modules/users/users.service'
import { compareHash, hash } from 'utils/bcrypt'
import { RegisterUserDto } from './dto/register-user.dto'
import Logging from 'library/Logging'
import { v4 as uuidv4 } from 'uuid'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    Logging.info('Validating user...')
    const user = await this.usersService.findBy({ email: email })

    if (!user) {
      throw new BadRequestException('Invalid credentials.')
    }
    if (!(await compareHash(password, user.password))) {
      throw new BadRequestException('Invalid credentials.')
    }
    Logging.info('User is valid.')
    return user
  }

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const hashedPassword = await hash(registerUserDto.password, 10)
    const user = this.usersService.create({ ...registerUserDto, password: hashedPassword })

    return user
  }

  async generateJwt(user: User): Promise<string> {
    return this.jwtService.signAsync({ sub: user.id, name: user.email, jti: uuidv4() })
  }

  async generateRefreshToken(user: User): Promise<string> {
    const payload = { sub: user.id, name: user.email, jti: uuidv4() }
    const expiresIn = this.configService.get('JWT_REFRESH_SECRET_EXPIRES')
    return this.jwtService.signAsync(payload, { expiresIn })
  }

  async refreshToken(refreshToken: string): Promise<string> {
    try {
      const verifedToken = await this.jwtService.verify(refreshToken)

      // Generate new access_token if token, payload is valid
      const newAccess_token = await this.generateJwt(verifedToken.sub.id)

      return newAccess_token
    } catch {
      throw new UnauthorizedException('Invalid refresh token.')
    }
  }

  async user(cookie: string): Promise<User> {
    const data = await this.jwtService.verifyAsync(cookie)
    return this.usersService.findById(data['id'])
  }

  async getUserId(request: Request): Promise<string> {
    const user = request.user as User
    return user.id
  }
}
