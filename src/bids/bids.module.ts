import { Module } from '@nestjs/common'
import { BidsService } from './bids.service'
import { BidsController } from './bids.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Bid } from 'entities/bid.entity'
import { AuctionItemModule } from 'modules/auction-item/auction-item.module'
import { UsersModule } from 'modules/users/users.module'

@Module({
  imports: [TypeOrmModule.forFeature([Bid]), AuctionItemModule, UsersModule],
  controllers: [BidsController],
  providers: [BidsService],
})
export class BidsModule {}
