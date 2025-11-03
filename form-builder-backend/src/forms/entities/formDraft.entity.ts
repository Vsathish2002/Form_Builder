import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Form } from './form.entity';

@Entity('form_drafts')
export class FormDraft {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  formId: string;

  @ManyToOne(() => Form)
  @JoinColumn({ name: 'formId' })
  form: Form;

  @Column({ type: 'text' })
  // Store draft data as JSON string containing partial form answers
  draftData: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  // Optional session identifier to track user's draft across browser sessions
  sessionId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
