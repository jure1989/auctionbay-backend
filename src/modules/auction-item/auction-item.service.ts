import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { AuctionItem } from 'entities/auction_item.entity'
import { AbstractService } from 'modules/abstract/abstract.service'
import { UsersService } from 'modules/users/users.service'
import { Repository } from 'typeorm'
import { CreateAuctionItemDto } from './dto/create-auction.dto'

@Injectable()
export class AuctionItemService extends AbstractService {
  constructor(
    @InjectRepository(AuctionItem)
    private readonly auctionItemRepository: Repository<AuctionItem>,
    private usersService: UsersService,
  ) {
    super(auctionItemRepository)
  }

  async createAuctionItem(id: string, createAuctionItemDto: CreateAuctionItemDto): Promise<AuctionItem> {
    const user = await this.usersService.findById(id)
    if (!user) {
      throw new NotFoundException('Something went wrong while creating an auction item')
    }
    return await this.auctionItemRepository.save({ ...createAuctionItemDto, user })
  }

  async findMyAuctionItems(id: string): Promise<AuctionItem[]> {
    return await this.auctionItemRepository
      .createQueryBuilder('auction_item')
      .leftJoinAndSelect('auction_item.bids', 'bids')
      .where('auction_item.user_id = :id', { id })
      .getMany()
  }
}
