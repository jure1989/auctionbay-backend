import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'entities/user.entity'
import { unlink } from 'fs/promises'
import { PostgresErrorCode } from 'helpers/postgresErrorCode.enum'
import Logging from 'library/Logging'
import { AbstractService } from 'modules/abstract/abstract.service'
import { join } from 'path'
import { Repository } from 'typeorm'
import { compareHash, hash } from 'utils/bcrypt'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService extends AbstractService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {
    super(usersRepository)
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.findBy({ email: createUserDto.email })

    if (user) {
      throw new BadRequestException('User with that email already exists.')
    }
    try {
      const newUser = this.usersRepository.create({ ...createUserDto })
      return this.usersRepository.save(newUser)
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException('Something went wrong while creating new user.')
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = (await this.findById(id)) as User
    const { email, password, confirm_password, ...data } = updateUserDto

    if (user.email !== email && email) {
      user.email = email
    }

    if (password && confirm_password) {
      if (password !== confirm_password) {
        throw new BadRequestException('Passwords do not match.')
      }
      try {
        const compareHashedMatch = await compareHash(password, user.password)
        if (!compareHashedMatch) {
          throw new BadRequestException('Incorrect password.')
        }
      } catch (error) {
        Logging.error(error)
        throw new BadRequestException('New password cannot be the same as your old password.')
      }
      user.password = await hash(password, 10)
    }
    try {
      Object.entries(data).map((entry) => {
        user[entry[0]] = entry[1]
      })

      return this.usersRepository.save(user)
    } catch (error) {
      Logging.error(error)
      if (error?.code === PostgresErrorCode) {
        throw new BadRequestException('User with that email already exists.')
      }
      throw new InternalServerErrorException('Something went wrong while updating the user.')
    }
  }

  async updateUserImage(id: string, avatar: string): Promise<User> {
    const user = await this.findById(id)
    return this.update(user.id, { avatar })
  }

  async deleteUserAvatar(id: string): Promise<User> {
    const user = await this.findById(id)

    if (user && user.avatar) {
      const avatarPath = join(process.cwd(), 'files', user.avatar)
      await unlink(avatarPath)

      user.avatar = null

      await this.usersRepository.save(user)
    }
    return user
  }
}
