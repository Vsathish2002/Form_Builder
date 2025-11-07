import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Form } from './form.entity';

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
  | 'file'
  | 'paragraph'
  | 'page'
  | 'autocomplete';

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
      'paragraph',
      'page',
      'autocomplete',
    ],
  })
  type: FieldType;

  @Column({ default: false })
  required: boolean;

  @Column({ type: 'json', nullable: true })
  options: any;


  @Column({ type: 'text', nullable: true })
  extraValue?: string; // For video/link URLs etc.

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'json', nullable: true })
  validation: any;

  @Column({ nullable: true })
  subtype?: string;

  @ManyToOne(() => Form, (form) => form.fields, {
    onDelete: 'CASCADE',
    eager: false,
  })
  form: Form;
}
