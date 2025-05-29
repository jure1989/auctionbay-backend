import { forwardRef, Module } from '@nestjs/common'
import { AuctionItemService } from './auction-item.service'
import { AuctionItemController } from './auction-item.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuctionItem } from 'entities/auction_item.entity'
import { User } from 'entities/user.entity'
import { UsersModule } from 'modules/users/users.module'
import { AuthModule } from 'modules/auth/auth.module'
import { PassportModule } from '@nestjs/passport'

@Module({
  imports: [
    TypeOrmModule.forFeature([AuctionItem, User]),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
    PassportModule,
  ],
  providers: [AuctionItemService],
  controllers: [AuctionItemController],
  exports: [AuctionItemService],
})
export class AuctionItemModule {}
