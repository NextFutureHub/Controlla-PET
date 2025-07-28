import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.user && (req.user as any).tenantId) {
      try {
        const tenant = await this.tenantRepository.findOne({
          where: { id: (req.user as any).tenantId }
        });
        req.tenant = tenant || undefined;
      } catch (error) {
        console.error('Error loading tenant:', error);
      }
    }
    next();
  }
} 