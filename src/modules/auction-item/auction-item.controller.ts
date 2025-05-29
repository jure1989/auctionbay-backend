import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common'
import { AuctionItem } from 'entities/auction_item.entity'
import { RequestWithUser } from 'interfaces/auth.interface'
import { JwtAuthGuard } from 'modules/auth/guards/jwt.guard'
import { AuctionItemService } from './auction-item.service'
import { CreateAuctionItemDto } from './dto/create-auction.dto'

@Controller('auction-item')
export class AuctionItemController {
  constructor(private auctionItemService: AuctionItemService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-auction-item')
  @HttpCode(HttpStatus.CREATED)
  async createAuctionItem(
    @Req() req: RequestWithUser,
    @Body()
    createAuctionItemDto: CreateAuctionItemDto,
  ): Promise<AuctionItem> {
    console.log('Request User:', req.user)
    const userId = req.user.id
    return await this.auctionItemService.createAuctionItem(userId, createAuctionItemDto)
  }
}
