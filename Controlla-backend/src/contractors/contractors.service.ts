import { Injectable, NotFoundException, InternalServerErrorException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contractor, ContractorStatus } from './entities/contractor.entity';
import { CreateContractorDto } from './dto/create-contractor.dto';
import { UpdateContractorDto } from './dto/update-contractor.dto';

@Injectable()
export class ContractorsService {
  private readonly logger = new Logger(ContractorsService.name);

  constructor(
    @InjectRepository(Contractor)
    private contractorsRepository: Repository<Contractor>,
  ) {}

  async create(createContractorDto: CreateContractorDto): Promise<Contractor> {
    try {
      const contractor = this.contractorsRepository.create({
        ...createContractorDto,
        rating: 0, // Начальный рейтинг
        status: ContractorStatus.ACTIVE // Статус по умолчанию
      });

      return await this.contractorsRepository.save(contractor);
    } catch (error) {
      this.logger.error(`Error creating contractor: ${error.message}`, error.stack);
      if (error.code === '23505') { // PostgreSQL unique violation
        throw new BadRequestException('Email already exists');
      }
      throw new InternalServerErrorException('Error creating contractor');
    }
  }

  async findAll(): Promise<Contractor[]> {
    try {
      const contractors = await this.contractorsRepository
        .createQueryBuilder('contractor')
        .leftJoinAndSelect('contractor.projects', 'project')
        .getMany();
      
      if (!contractors) {
        return [];
      }
      
      return contractors;
    } catch (error) {
      this.logger.error(`Error finding all contractors: ${error.message}`, error.stack);
      if (error instanceof Error) {
        throw new InternalServerErrorException(`Error retrieving contractors: ${error.message}`);
      }
      throw new InternalServerErrorException('Error retrieving contractors');
    }
  }

  async findOne(id: string): Promise<Contractor> {
    try {
      const contractor = await this.contractorsRepository.findOne({
        where: { id },
        relations: ['projects'],
      });

      if (!contractor) {
        throw new NotFoundException(`Contractor with ID ${id} not found`);
      }

      return contractor;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding contractor ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error retrieving contractor');
    }
  }

  async update(id: string, updateContractorDto: UpdateContractorDto): Promise<Contractor> {
    try {
      const contractor = await this.findOne(id);
      Object.assign(contractor, updateContractorDto);
      return await this.contractorsRepository.save(contractor);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating contractor ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error updating contractor');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.contractorsRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Contractor with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error removing contractor ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error removing contractor');
    }
  }

  async updateStatus(id: string, status: ContractorStatus): Promise<Contractor> {
    try {
      const contractor = await this.findOne(id);
      contractor.status = status;
      return await this.contractorsRepository.save(contractor);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating contractor status ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error updating contractor status');
    }
  }

  async updateRating(id: string, newRating: number): Promise<Contractor> {
    try {
      const contractor = await this.findOne(id);
      // Обновляем рейтинг как среднее арифметическое
      contractor.rating = (contractor.rating + newRating) / 2;
      return await this.contractorsRepository.save(contractor);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating contractor rating ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error updating contractor rating');
    }
  }
}
