import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { Base } from './base.entity'
import { Bid } from './bid.entity'
import { User } from './user.entity'

@Entity()
export class AuctionItem extends Base {
  @Column()
  title: string

  @Column()
  description: string

  @Column()
  starting_price: number

  @Column()
  end_date: string

  @Column({ nullable: true })
  image?: string

  @Column()
  duration: string

  @Column()
  current_status: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User

  @OneToMany(() => Bid, (bid) => bid.auction_item)
  bids: Bid[]
}
