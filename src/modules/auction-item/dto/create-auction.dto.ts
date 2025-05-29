import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateAuctionItemDto {
  @IsNotEmpty()
  @IsString()
  title: string

  @IsNotEmpty()
  @IsString()
  description: string

  @IsNotEmpty()
  @IsNumber()
  starting_price: number

  @IsNotEmpty()
  @IsString()
  end_date: string

  @IsOptional()
  @IsString()
  image?: string
}
