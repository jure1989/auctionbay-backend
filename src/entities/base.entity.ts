import { Expose } from 'class-transformer'
import { IsUUID } from 'class-validator'
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity()
export class Base {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  @Expose()
  id: string

  @CreateDateColumn()
  @Expose()
  created_at: Date

  @UpdateDateColumn()
  @Expose()
  updated_at: Date
}
