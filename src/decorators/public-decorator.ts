import { SetMetadata } from '@nestjs/common/decorators/index'

export const Public = () => SetMetadata('isPublic', true)
