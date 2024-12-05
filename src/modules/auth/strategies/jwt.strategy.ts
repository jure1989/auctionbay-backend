import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { UsersService } from 'modules/users/users.service'
import { Request } from 'express'
import { ExtractJwt } from 'passport-jwt'
import { Strategy } from 'passport-local'
import { TokenPayload } from 'interfaces/auth.interface'
import { User } from 'entities/user.entity'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private usersService: UsersService, configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // how to extract jwt ( from cookies)
        (request: Request) => {
          return request?.cookies?.access_token
        },
      ]),
      secretOrKey: configService.get('JWT_SECRET'), // validation
    })
  }

  async validate(payload: TokenPayload): Promise<User> {
    const user = this.usersService.findById(payload.sub)

    return user
  }
}
