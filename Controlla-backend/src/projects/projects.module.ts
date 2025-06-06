import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from './entities/project.entity';
import { Contractor } from '../contractors/entities/contractor.entity';
import { ContractorsModule } from '../contractors/contractors.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Contractor]),
    ContractorsModule
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService]
})
export class ProjectsModule {}
