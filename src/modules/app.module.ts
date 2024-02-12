import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { configValidationSchema } from 'config/schema.config'
import { LoggerMiddleware } from 'middleware/logger.middleware'
import { DatabaseModule } from './database/database.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
    }),
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}
