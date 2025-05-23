import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractorsService } from './contractors.service';
import { ContractorsController } from './contractors.controller';
import { Contractor } from './entities/contractor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contractor])],
  controllers: [ContractorsController],
  providers: [ContractorsService],
  exports: [ContractorsService],
})
export class ContractorsModule {}
