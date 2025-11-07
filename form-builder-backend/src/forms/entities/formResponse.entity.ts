// src/forms/entities/formResponse.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Form } from './form.entity';

@Entity('form_responses')
export class FormResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Form, (form) => form.responses, { onDelete: 'CASCADE' })
  form: Form;

  // ✅ store all answers as JSON object
  @Column({ type: 'jsonb' })
  responseData: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
