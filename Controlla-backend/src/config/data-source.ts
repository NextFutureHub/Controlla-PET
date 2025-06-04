import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { Tenant } from '../tenants/entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import { Contractor } from '../contractors/entities/contractor.entity';
import { Task } from '../tasks/entities/task.entity';
import { Subtask } from '../tasks/entities/subtask.entity';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_DATABASE'),
  entities: [Tenant, User, Project, Contractor, Task, Subtask],
  migrations: ['src/migrations/*{.ts,.js}'],
  synchronize: true,
}); 