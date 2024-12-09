import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseInterceptors,
} from '@nestjs/common'
import { Public } from 'decorators/public-decorator'
import { User } from 'entities/user.entity'
import { AuthService } from './auth.service'
import { RegisterUserDto } from './dto/register-user.dto'
import { Response } from 'express'

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterUserDto, @Res({ passthrough: true }) res: Response): Promise<User> {
    const newUser = await this.authService.register(body)
    const access_token = await this.authService.generateJwt(newUser)
    const refresh_token = await this.authService.generateRefreshToken(newUser)

    res.cookie('access_token', access_token, {
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
    })

    res.cookie('refresh_token', refresh_token, {
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
    })

    return newUser
  }
}
