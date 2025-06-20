import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { AuctionItem } from 'entities/auction_item.entity'
import { RequestWithUser } from 'interfaces/auth.interface'
import { JwtAuthGuard } from 'modules/auth/guards/jwt.guard'
import { AuctionItemService } from './auction-item.service'
import { CreateAuctionItemDto } from './dto/create-auction.dto'

@Controller('auction-item')
@UseInterceptors(ClassSerializerInterceptor)
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

  @UseGuards(JwtAuthGuard)
  @Get('find-my-auction-items/:id')
  @HttpCode(HttpStatus.OK)
  async findMyAuctionItems(@Req() req: RequestWithUser): Promise<AuctionItem[]> {
    const user = req.user.id
    return await this.auctionItemService.findMyAuctionItems(user)
  }
}
