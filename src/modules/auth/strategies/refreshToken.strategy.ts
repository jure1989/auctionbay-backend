import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { UsersService } from 'modules/users/users.service'
import { Request } from 'express'
import { ExtractJwt } from 'passport-jwt'
import { Strategy } from 'passport-jwt'
import { TokenPayload } from 'interfaces/auth.interface'
import { User } from 'entities/user.entity'

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
  constructor(private usersService: UsersService, configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // how to extract jwt ( from cookies)
        (request: Request) => {
          return request?.cookies?.refresh_token
        },
      ]),
      secretOrKey: configService.get('JWT_REFRESH_SECRET'), // validation
      passReqToCallback: true,
    })
  }

  async validate(request: Request, payload: TokenPayload): Promise<User> {
    const refresh_token = request?.cookies?.refresh_token
    if (!refresh_token) {
      throw new UnauthorizedException()
    }

    const user = await this.usersService.findById(payload.sub)

    if (!user) {
      throw new UnauthorizedException('User doesent exists')
    }
    return user
  }
}
