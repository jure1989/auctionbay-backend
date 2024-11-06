import { Column, Entity } from 'typeorm'
import { Base } from './base.entity'

@Entity()
export class Token extends Base {
  @Column({ unique: true })
  token: string

  @Column()
  email: string

  @Column()
  userId: string

  @Column()
  jti: string
}
