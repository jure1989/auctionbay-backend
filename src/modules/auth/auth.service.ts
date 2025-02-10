import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { User } from 'entities/user.entity'
import { Request } from 'express'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from 'modules/users/users.service'
import { compareHash, hash } from 'utils/bcrypt'
import { RegisterUserDto } from './dto/register-user.dto'
import Logging from 'library/Logging'
import { v4 as uuidv4 } from 'uuid'
import { ConfigService } from '@nestjs/config'
import { JwtType } from 'interfaces/auth.interface'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
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
    const payload = { sub: user.id, name: user.email, type: JwtType.access_token, jti: uuidv4() }
    const expiresIn = await this.configService.get('JWT_SECRET_EXPIRES')

    return this.jwtService.signAsync(payload, { secret: await this.configService.get('JWT_SECRET'), expiresIn })
  }

  async generateRefreshToken(user: User): Promise<string> {
    const payload = { sub: user.id, name: user.email, type: JwtType.refresh_token, jti: uuidv4() }
    const expiresIn = await this.configService.get('JWT_REFRESH_SECRET_EXPIRES')
    console.log('expiresIn', expiresIn)
    return this.jwtService.signAsync(payload, {
      secret: await this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn,
    })
  }

  async refreshToken(req: Request): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const refresh_token = req.cookies['refresh_token']

      if (!refresh_token) {
        throw new UnauthorizedException('Token not valid')
      }
      const decodedRefreshToken = await this.jwtService.verifyAsync(refresh_token, {
        secret: await this.configService.get('JWT_REFRESH_SECRET'),
      })

      //Checking if refresh_token is already blacklisted:
      const isBlacklisted = await this.isTokenBlacklisted(decodedRefreshToken.jti)
      if (isBlacklisted) {
        throw new UnauthorizedException('Token is already blacklisted')
      }

      const user = await this.usersService.findById(decodedRefreshToken.sub)

      if (!user) {
        throw new UnauthorizedException('User not found')
      }

      // Backlist old refresh_token:
      const ttl = await this.configService.get('JWT_REFRESH_SECRET_EXPIRES')
      await this.blacklistToken(decodedRefreshToken.jti, ttl)
      console.log('jti', decodedRefreshToken.jti)
      console.log('ttl', ttl)

      const access_token = await this.generateJwt(user)
      // generate new refresh token
      const newRefreshToken = await this.generateRefreshToken(user)

      return { access_token, refresh_token: newRefreshToken }
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  async blacklistToken(jti: string, ttl: number): Promise<void> {
    try {
      console.log(`blacklisting token with: ${jti}`)
      await this.cacheManager.set(`blacklist:${jti}`, true, { ttl })
      console.log('ttl', ttl)
      console.log(`toke with jti ${jti} blacklisted successfully`)
    } catch (error) {
      throw new Error('Failed to blacklist token')
    }
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    try {
      const blacklistedToken = await this.cacheManager.get(`blacklist:${jti}`)

      if (!blacklistedToken) {
        return false
      }
      return true
    } catch (error) {
      throw new Error('Failed to check if the token is blacklisted.')
    }
  }

  async logout(req: Request): Promise<{ message: string }> {
    try {
      const refresh_token = req.cookies['refresh_token']

      if (refresh_token) {
        const decodedRefreshToken = await this.jwtService.verifyAsync(refresh_token, {
          secret: await this.configService.get('JWT_REFRESH_SECRET'),
        })
        const blacklisted = await this.isTokenBlacklisted(decodedRefreshToken.jti)
        const ttl = await this.configService.get('JWT_REFRESH_SECRET_EXPIRES')

        if (!blacklisted) {
          await this.blacklistToken(decodedRefreshToken.jti, ttl)
        }
        console.log(decodedRefreshToken)
      }
      //return { message: 'Successfully logged out' }
    } catch (error) {
      throw new Error('Failed to log out')
    }
    return { message: 'Successfully logged out' }
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
