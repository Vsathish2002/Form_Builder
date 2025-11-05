import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Form } from './form.entity';
import { FormResponseItem } from './formResponseItem.entity';

@Entity()
export class FormResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Form, form => form.responses, { onDelete: 'CASCADE' })
  form: Form;

  @OneToMany(() => FormResponseItem, item => item.response, { cascade: true, eager: true, onDelete: 'CASCADE' })
  items: FormResponseItem[];

  @CreateDateColumn()
  createdAt: Date;
}
