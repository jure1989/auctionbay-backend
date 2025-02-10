import { SetMetadata } from '@nestjs/common'

export const RequiredRefreshToken = () => SetMetadata('requiredRefreshtoken', true)
