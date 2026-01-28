import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ClassSerializerInterceptor,
  UseInterceptors,
  Query,
  Param,
} from '@nestjs/common'
import { Bid } from 'entities/bid.entity'
import { queryPaginatedResult } from 'interfaces/queryPaginated-result.interface'
import { BidsService } from './bids.service'
import { CreateBidDto } from './dto/create-bid.dto'

@Controller('bids')
@UseInterceptors(ClassSerializerInterceptor)
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  //@UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createBid(@Body() createBidDto: CreateBidDto): Promise<Bid> {
    return this.bidsService.createBid(createBidDto)
  }

  @Get('auctionItem/:auctionItemId')
  @HttpCode(HttpStatus.OK)
  async getAllBids(
    @Param('auctionItemId') auctionItemId: string,
    @Query('page')
    page: number,
    @Query('pageSize') pageSize: number,
  ): Promise<queryPaginatedResult<Bid>> {
    return await this.bidsService.getAllBids(auctionItemId, pageSize, page)
  }

  @Get('bidder/:userId')
  @HttpCode(HttpStatus.OK)
  async getBidsByBidderId(
    @Param('userId') userId: string,
    @Query('pageSize') pageSize: number,
    @Query('page') page: number,
  ): Promise<queryPaginatedResult<Bid>> {
    return await this.bidsService.getBidsByBidderId(userId, pageSize, page)
  }

  @Get('highest/:auctionItemId')
  @HttpCode(HttpStatus.OK)
  async getHighestBid(@Param('auctionItemId') auctionItemId: string): Promise<Bid> {
    return await this.bidsService.getHighestBid(auctionItemId)
  }
}
