import { User } from 'entities/user.entity'
import { Request } from 'express'

export interface TokenPayload {
  name: string
  sub: string
  type: JwtType
}

export interface RequestWithUser extends Request {
  user: User
}

export enum JwtType {
  access_token = 'ACCESS_TOKEN',
}
