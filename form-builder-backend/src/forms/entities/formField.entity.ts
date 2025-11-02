import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Form } from './form.entity';
import { FormResponseItem } from './formResponseItem.entity';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'checkbox'
  | 'radio'
  | 'select'
  | 'header'
  | 'date'
  | 'section'
  | 'file';

@Entity()
export class FormField {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  label: string;

  @Column({
    type: 'enum',
    enum: [
      'text',
      'textarea',
      'number',
      'checkbox',
      'radio',
      'select',
      'header',
      'date',
      'section',
      'file',
    ],
  })
  type: FieldType;

  @Column({ default: false })
  required: boolean;

  @Column({ type: 'simple-array', nullable: true })
  options: string[];

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'json', nullable: true })
  validation: any;

  @ManyToOne(() => Form, (form) => form.fields, { onDelete: 'CASCADE', eager: false })
  form: Form;

  @OneToMany(() => FormResponseItem, (item) => item.field, { cascade: true })
  responseItems: FormResponseItem[];
}
