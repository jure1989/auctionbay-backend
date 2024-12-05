import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { AuctionItem } from './auction_item.entity'
import { Base } from './base.entity'
import { User } from './user.entity'

@Entity()
export class Bid extends Base {
  @Column()
  bid_amount: number

  @ManyToOne(() => AuctionItem)
  @JoinColumn({ name: 'auction_item_id' })
  auction_item: AuctionItem

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  bidder: User
}
