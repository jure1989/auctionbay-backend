import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { AuctionItem } from 'entities/auction_item.entity'
import { queryPaginatedResult } from 'interfaces/queryPaginated-result.interface'
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

  async findMyAuctionItems(id: string, pageSize = 10, page = 1): Promise<queryPaginatedResult<AuctionItem>> {
    const query = this.auctionItemRepository
      .createQueryBuilder('auction-item')
      .leftJoinAndSelect('auction-item.bids', 'bids')
      .where('auction-item.user_id = :id', { id })
      .addOrderBy('auction-item.created_at', 'DESC')

    return await this.paginateQueryBuilder(query, pageSize, page)
  }
}
