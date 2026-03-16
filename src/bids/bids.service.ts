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

  async getUserHighestBid(bidderId: string, auctionItemId: string): Promise<Bid> {
    const query = this.bidsRepository
      .createQueryBuilder('bid')
      .leftJoinAndSelect('bid.bidder', 'bidder')
      .leftJoinAndSelect('bid.auction_item', 'auction_item')
      .where('bidder.id = :bidderId', { bidderId })
      .andWhere('auction_item.id = :auctionItemId', { auctionItemId })
      .orderBy('bid.bid_amount', 'DESC')
      .getOne()
    return await query
  }

  async getBidingHistory(auctionItemId: string): Promise<Bid[]> {
    const query = this.bidsRepository
      .createQueryBuilder('bid')
      .leftJoinAndSelect('bid.auction_item', 'auction_item')
      .leftJoinAndSelect('bid.bidder', 'bidder')
      .where('auction_item.id = :id', { id: auctionItemId })
      .orderBy('bid.bid_amount', 'DESC')
      .limit(3)
      .getMany()
    return await query
  }

  async getWonBids(bidderId: string, pageSize = 10, page = 1): Promise<queryPaginatedResult<Bid>> {
    const query = this.bidsRepository
      .createQueryBuilder('bid')
      .leftJoinAndSelect('bid.bidder', 'bidder')
      .leftJoinAndSelect('bid.auction_item', 'auction_item')
      .where('auction_item.current_status = :status', { status: 'finished' })
      .andWhere('bidder.id = :bidderId', { bidderId })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('MAX(innerBid.bid_amount)')
          .from(Bid, 'innerBid')
          .where('innerBid.auction_item_id = bid.auction_item_id')
          .getQuery()
        return 'bid.bid_amount = (' + subQuery + ')'
      })
    return await this.paginateQueryBuilder(query, pageSize, page)
  }
}
