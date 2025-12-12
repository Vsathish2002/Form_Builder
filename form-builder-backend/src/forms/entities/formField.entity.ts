import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
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
  | 'autocomplete'
  | 'group';

export interface FieldDefinition {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: any;
  extraValue?: string;
  order: number;
  validation?: any;
  subtype?: string;
}

@Entity()
@Unique(['form'])
export class FormField {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb', nullable: true })
  fields: FieldDefinition[];

  @ManyToOne(() => Form, (form) => form.fields, {
    onDelete: 'CASCADE',
    eager: false,
  })
  form: Form;
}
