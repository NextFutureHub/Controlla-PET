import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';

async function createSuperAdmin() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5433,
    username: 'postgres',
    password: 'postgres',
    database: 'controlla_db',
    entities: [User],
    synchronize: false,
    ssl: false,
  });

  try {
    await dataSource.initialize();
    console.log('Connected to database');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const superAdmin = dataSource.getRepository(User).create({
      email: 'admin@controlla.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    });

    await dataSource.getRepository(User).save(superAdmin);
    console.log('Super admin created successfully!');

    await dataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createSuperAdmin().catch(console.error); 