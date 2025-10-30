// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
// import { FormResponse } from './formResponse.entity';
// import { FormField } from './formField.entity';

// @Entity()
// export class FormResponseItem {
//   @PrimaryGeneratedColumn('uuid') id: string;

//   @ManyToOne(() => FormResponse, response => response.items, { onDelete: 'CASCADE' })
//   response: FormResponse;

//   @ManyToOne(() => FormField, { eager: true })
//   field: FormField;

//   @Column({ type: 'text' }) value: string;
// }

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { FormResponse } from './formResponse.entity';
import { FormField } from './formField.entity';

@Entity()
export class FormResponseItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => FormResponse, response => response.items, { onDelete: 'CASCADE' })
  response: FormResponse;

  @ManyToOne(() => FormField, field => field.responseItems, { onDelete: 'CASCADE', eager: true })
  field: FormField;

  @Column({ type: 'text' })
  value: string;
}
