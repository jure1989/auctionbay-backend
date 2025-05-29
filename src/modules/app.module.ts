import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { configValidationSchema } from 'config/schema.config'
import { LoggerMiddleware } from 'middleware/logger.middleware'
import { AuthModule } from './auth/auth.module'
import { DatabaseModule } from './database/database.module'
import { UsersModule } from './users/users.module'
import { AuctionItemModule } from './auction-item/auction-item.module'
import { ScheduleModule } from '@nestjs/schedule'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    AuctionItemModule,
  ],
  controllers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}
