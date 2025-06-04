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

  async findAll(page = 1, limit = 10): Promise<{ contractors: Contractor[]; total: number; totalPages: number }> {
    try {
      const [contractors, total] = await this.contractorsRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: {
          createdAt: 'DESC'
        }
      });
      
      const totalPages = Math.ceil(total / limit);
      
      return {
        contractors,
        total,
        totalPages
      };
    } catch (error) {
      this.logger.error(`Error finding all contractors: ${error.message}`, error.stack);
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
      
      // Проверяем, что newRating является числом и находится в допустимом диапазоне
      if (typeof newRating !== 'number' || isNaN(newRating) || newRating < 0 || newRating > 5) {
        throw new BadRequestException('Rating must be a number between 0 and 5');
      }

      // Преобразуем текущий рейтинг в число, если он существует
      let currentRating = 0;
      if (contractor.rating !== null && contractor.rating !== undefined) {
        const parsedRating = Number(contractor.rating);
        if (!isNaN(parsedRating)) {
          currentRating = parsedRating;
        }
      }

      // Вычисляем новый рейтинг
      const averageRating = (currentRating + newRating) / 2;
      contractor.rating = Number(averageRating.toFixed(2));

      // Проверяем, что рейтинг не стал NaN
      if (isNaN(contractor.rating)) {
        contractor.rating = 0;
      }

      const savedContractor = await this.contractorsRepository.save(contractor);
      this.logger.debug(`Updated rating for contractor ${id}: ${savedContractor.rating}`);
      return savedContractor;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error updating contractor rating ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error updating contractor rating');
    }
  }
}
