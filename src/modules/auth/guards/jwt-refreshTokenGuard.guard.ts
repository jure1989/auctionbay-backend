import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { AuthGuard } from '@nestjs/passport'
import { Observable } from 'rxjs'

@Injectable()
export class JwtRefreshTokenGuard extends AuthGuard('jwt-refresh-token') {
  constructor(private reflector: Reflector, private jwtService: JwtService, private configService: ConfigService) {
    super()
  }
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()

    try {
      const refresh_token = request.cookies['refresh_token']

      if (!refresh_token) {
        throw new UnauthorizedException('Refresh token is missing')
      }

      this.jwtService.verify(refresh_token, { secret: this.configService.get('JWT_REFRESH_SECRET') })

      return true
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }
}
