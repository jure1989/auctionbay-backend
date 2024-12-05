import { PassportStrategy } from '@nestjs/passport'
import { User } from 'entities/user.entity'
import { Strategy } from 'passport-local'
import { AuthService } from '../auth.service'

export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameFiled: 'email',
    })
  }

  async validate(email: string, password: string): Promise<User> {
    return this.authService.validateUser(email, password)
  }
}
