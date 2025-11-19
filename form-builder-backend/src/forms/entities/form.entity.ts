
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { FormField } from './formField.entity';
import { FormResponse } from './formResponse.entity';

@Entity()
export class Form {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ unique: true })
  slug: string;

  @ManyToOne(() => User, { eager: true })
  owner: User;

  @OneToMany(() => FormField, field => field.form, { cascade: true, eager: true, onDelete: 'CASCADE' })
  fields: FormField[];

  @OneToMany(() => FormResponse, res => res.form, { cascade: true, onDelete: 'CASCADE' })
  responses: FormResponse[];

  @Column({ type: 'varchar', length: 10, default: 'Active' })
  status: 'Active' | 'Inactive';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

