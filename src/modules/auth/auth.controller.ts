import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { Public } from 'decorators/public-decorator'
import { User } from 'entities/user.entity'
import { AuthService } from './auth.service'
import { RegisterUserDto } from './dto/register-user.dto'
import { Response } from 'express'
import { RequestWithUser } from 'interfaces/auth.interface'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { JwtRefreshTokenGuard } from './guards/jwt-refreshTokenGuard.guard'
import { JwtService } from '@nestjs/jwt'

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private authService: AuthService, private jwtService: JwtService) {}

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

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: RequestWithUser, @Res({ passthrough: true }) res: Response): Promise<User> {
    const user = req.user
    const access_token = await this.authService.generateJwt(req.user)
    const refresh_token = await this.authService.generateRefreshToken(req.user)

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

    return user
  }

  @Public()
  @UseGuards(JwtRefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: RequestWithUser, @Res({ passthrough: true }) res: Response) {
    const { access_token, refresh_token } = await this.authService.refreshToken(req)

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

    return { access_token, refresh_token }
  }

  @Public()
  @UseGuards(JwtRefreshTokenGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: RequestWithUser, @Res({ passthrough: true }) res: Response) {
    const refresh_token = req.cookies['refresh_token']
    //await this.authService.logout(refresh_token)
    await this.authService.logout(req)
    res.clearCookie('refresh_token')
    res.clearCookie('access_token')

    res.json({ message: 'Successfully logged out' })
  }
}
