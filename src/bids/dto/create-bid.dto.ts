import { IsNotEmpty, IsNumber } from 'class-validator'

export class CreateBidDto {
  @IsNotEmpty()
  @IsNumber()
  bid_amount: number

  @IsNotEmpty()
  auction_item_id: string

  @IsNotEmpty()
  user_id: string
}
