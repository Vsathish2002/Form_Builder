import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { Form } from '../forms/entities/form.entity';
import { FormField } from '../forms/entities/formField.entity';
import { FormResponse } from '../forms/entities/formResponse.entity';
import { FormResponseItem } from '../forms/entities/formResponseItem.entity';
import { FormDraft } from '../forms/entities/formDraft.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '2002',
  database: process.env.DB_NAME || 'formdb',
  entities: [
    User,
    Role,
    Form,
    FormField,
    FormResponse,
    FormResponseItem,
    FormDraft,
  ],
  synchronize: true, // disable in production
};
