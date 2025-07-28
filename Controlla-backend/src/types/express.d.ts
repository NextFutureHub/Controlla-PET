import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';

declare global {
  namespace Express {
    interface Request {
      user?: User & {
        tenantId?: string;
      };
      tenant?: Tenant;
    }
  }
} 