import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Tenant } from '../../tenants/entities/tenant.entity';

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Tenant => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant;
  },
); 