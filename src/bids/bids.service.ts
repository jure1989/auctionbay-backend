import { BadRequestException, Injectable, Req } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Bid } from 'entities/bid.entity'
import { queryPaginatedResult } from 'interfaces/queryPaginated-result.interface'
import { AbstractService } from 'modules/abstract/abstract.service'
import { AuctionItemService } from 'modules/auction-item/auction-item.service'
import { UsersService } from 'modules/users/users.service'
import { Repository } from 'typeorm'
import { CreateBidDto } from './dto/create-bid.dto'

@Injectable()
export class BidsService extends AbstractService {
  constructor(
    @InjectRepository(Bid) private readonly bidsRepository: Repository<Bid>,
    private readonly usersService: UsersService,
    private readonly auctionItemService: AuctionItemService,
  ) {
    super(bidsRepository)
  }
  async createBid(createBidDto: CreateBidDto): Promise<Bid> {
    const user = await this.usersService.findById(createBidDto.user_id)

    if (!user) {
      throw new BadRequestException('User does not exists.')
    }

    const auctionItem = await this.auctionItemService.findById(createBidDto.auction_item_id)

    if (!auctionItem) {
      throw new BadRequestException('Auction item does not exists.')
    }

    if (auctionItem.current_status === 'closed') {
      throw new BadRequestException('Auction has already ended.')
    }

    const createBid = this.bidsRepository.create({
      bid_amount: createBidDto.bid_amount,
      auction_item: auctionItem,
      bidder: user,
    })

    return await this.bidsRepository.save(createBid)
  }

  async getAllBids(auctionItemId: string, pageSize = 10, page = 1): Promise<queryPaginatedResult<Bid>> {
    const query = this.bidsRepository
      .createQueryBuilder('bid')
      .leftJoinAndSelect('bid.auction_item', 'auction_item')
      .leftJoinAndSelect('bid.bidder', 'bidder')
      .where('bid.auction_item.id = :id', { id: auctionItemId })
      .orderBy('bid.created_at', 'DESC')
    return await this.paginateQueryBuilder(query, pageSize, page)
  }

  async getBidsByBidderId(userId: string, pageSize = 10, page = 1) {
    const query = this.bidsRepository
      .createQueryBuilder('bid')
      .leftJoinAndSelect('bid.bidder', 'bidder')
      .leftJoinAndSelect('bid.auction_item', 'auction_item')
      .where('bid.bidder.id = :id', { id: userId })
    return await this.paginateQueryBuilder(query, pageSize, page)
  }

  async getHighestBid(auctionItemId: string): Promise<Bid> {
    const query = this.bidsRepository
      .createQueryBuilder('bid')
      .leftJoinAndSelect('bid.bidder', 'bidder')
      .leftJoinAndSelect('bid.auction_item', 'auction_item')
      .where('auction_item.id = :id', { id: auctionItemId })
      .orderBy('bid.bid_amount', 'DESC')
      .getOne()
    return await query
  }
}
