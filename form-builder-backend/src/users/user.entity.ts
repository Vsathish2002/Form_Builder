// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
// import { Role } from '../roles/role.entity';

// @Entity()
// export class User {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column()
//   name: string;

//   @Column({ unique: true })
//   email: string;

//   @Column()
//   password: string;

//   @Column({ type: 'varchar', nullable: true })
//   resetToken: string | null;

//   @Column({ type: 'timestamp', nullable: true })
//   resetTokenExpiry: Date | null;

//   @ManyToOne(() => Role, { eager: true })
//   role: Role;
// }
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Role } from '../roles/role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'varchar', nullable: true })
  resetToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpiry: Date | null;

  // ⭐ NEW FIELDS YOU NEED ⭐
  @Column({ nullable: true })
  gender: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @ManyToOne(() => Role, { eager: true })
  role: Role;
}
